"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { createSynthesisGraph } from "@/lib/ai/graph";
import { getLlmClient, invokeLlmWithFallback, getGroqModel, getGeminiModel, getLlmProvider } from "@/lib/ai/provider";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/chat";
import { searchTavily } from "@/lib/tools/tavily";
import { checkUserAiQuotaAction, checkUserTavilyQuotaAction, logAiUsageAction } from "@/lib/services/quota";
import { logAuditEventAction } from "@/lib/services/audit";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; category?: string; operation?: string } };

export interface ProposalPayload {
  type: "STACK_CHANGE" | "REQUIREMENT_UPDATE" | "ROADMAP_UPDATE" | "GENERAL_UPDATE";
  summary: string;
  targetField: "techStack" | "requirements" | "problemStatement" | "assumptions";
  newValue: any;
  affectedAreas: string[];
  reasoning?: string;
}

const OUT_OF_SCOPE_FALLBACK = "I'm not able to understand that question.";

/**
 * Audit intent to enforce strict project scope boundary
 */
function isOutofScopeQuery(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Explicit off-topic software coding/recipe/homework/general knowledge queries
  const offTopicRegexes = [
    /\b(recipe|cooking|cake|pizza|burger)\b/i,
    /\b(weather|temperature|forecast)\b/i,
    /\b(who is the president|who won the)\b/i,
    /\b(write a python calculator|build me a snake game|tic tac toe)\b/i,
    /\b(write an email to|solve my math homework|essay about)\b/i,
    /\b(tell me a joke|capital of|how far is the moon)\b/i,
  ];

  if (offTopicRegexes.some((regex) => regex.test(q))) {
    return true;
  }

  // Generic non-architectural code generation prompts
  if (
    q.startsWith("write a generic") ||
    q.startsWith("write a python script to") ||
    q.startsWith("how do I bake") ||
    q.startsWith("what is the meaning of life")
  ) {
    return true;
  }

  return false;
}

import { Command } from "@langchain/langgraph";
import { QuestionItem } from "@/lib/validations/ai";

/**
 * Run AI Requirement Synthesis on a project with Agentic Ask-User Tool Interrupt support
 */
export async function analyzeProjectAction(
  projectId: string,
  userAnswers?: Record<string, any>
): Promise<ActionResult<{ success: boolean; status?: string; questions?: QuestionItem[] }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to analyze a project" },
    };
  }

  // Quota Guard Check
  const quotaCheck = await checkUserAiQuotaAction(userId);
  if (!quotaCheck.allowed) {
    return {
      success: false,
      error: quotaCheck.error!,
    };
  }

  const startTime = Date.now();

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    const graph = createSynthesisGraph();
    const stateResult = await graph.invoke(
      {
        projectId: project.id,
        projectName: project.name,
        ideaText: project.ideaText,
        userAnswers: userAnswers || {},
      },
      { configurable: { thread_id: projectId } }
    );

    // Check if graph execution interrupted for user questions
    if (
      stateResult.status === "NEEDS_INPUT" ||
      (stateResult as any).__interrupt__?.length > 0
    ) {
      const interruptData = (stateResult as any).__interrupt__?.[0]?.value || stateResult;
      const questions: QuestionItem[] = interruptData.questions || [];

      // Save open questions in DB to persist state across refresh
      await prisma.project.update({
        where: { id: projectId },
        data: { openQuestions: questions as any },
      });

      return {
        success: true,
        data: {
          success: true,
          status: "NEEDS_INPUT",
          questions,
        },
      };
    }

    const synthesis = stateResult.result;
    if (!synthesis) {
      return {
        success: false,
        error: { code: "AI_ERROR", message: "AI synthesis failed to produce a valid blueprint" },
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          problemStatement: synthesis.problemStatement,
          techStack: synthesis.suggestedStack,
          requirements: {
            functional: synthesis.functionalRequirements,
            nonFunctional: synthesis.nonFunctionalRequirements,
          },
          openQuestions: Prisma.DbNull,
          status: "ARCHITECTURE",
        },
      });

      // Clear old generated records to avoid duplication on re-synthesis
      await tx.feature.deleteMany({ where: { projectId } });
      await tx.decision.deleteMany({ where: { projectId } });

      if (synthesis.suggestedStack.length > 0) {
        await tx.feature.createMany({
          data: [
            {
              projectId,
              title: "Core System Infrastructure & Authentication",
              description: `Initial architecture stack setup with ${synthesis.suggestedStack.slice(0, 3).join(", ")}.`,
              phase: "MVP",
              status: "planned",
            },
            {
              projectId,
              title: "Primary Relational Data Schema",
              description: "Database models, indexes, and single-tenant ownership constraints.",
              phase: "MVP",
              status: "planned",
            },
          ],
        });

        await tx.decision.create({
          data: {
            projectId,
            decision: `Selected initial core stack: ${synthesis.suggestedStack.join(", ")}`,
            reasoning: "Chosen to maximize development velocity, maintainability, and data security.",
            alternative: "Monolithic framework",
            affectedAreas: ["Architecture", "Database", "Security"],
          },
        });
      }
    });

    const providerName = getLlmProvider();
    await logAiUsageAction({
      userId,
      projectId,
      operation: "analyze",
      provider: providerName,
      model: providerName === "groq" ? getGroqModel() : getGeminiModel(),
      promptTokens: 800,
      completionTokens: 600,
      totalTokens: 1400,
      durationMs: Date.now() - startTime,
      status: "success",
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { success: true, status: "COMPLETED" } };
  } catch (error: any) {
    console.error("[AI] Error in analyzeProjectAction:", error);
    const msg = error?.message || String(error);
    return {
      success: false,
      error: {
        code: "AI_ANALYSIS_ERROR",
        operation: "analyze",
        message: msg.includes("Failed:") ? msg : `Failed to analyze project: ${msg}`,
      },
    };
  }
}

/**
 * Resume AI Synthesis when user answers agent's questions
 */
export async function resumeProjectSynthesisAction(
  projectId: string,
  answers: Record<string, any>
): Promise<ActionResult<{ success: boolean; status?: string; questions?: QuestionItem[] }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to resume synthesis" },
    };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    const graph = createSynthesisGraph();
    let stateResult: any;

    try {
      stateResult = await graph.invoke(
        new Command({ resume: answers }),
        { configurable: { thread_id: projectId } }
      );
    } catch (_) {
      // Fallback: re-invoke graph directly with user answers in state
      return await analyzeProjectAction(projectId, answers);
    }

    if (
      stateResult.status === "NEEDS_INPUT" ||
      stateResult.__interrupt__?.length > 0
    ) {
      const interruptData = stateResult.__interrupt__?.[0]?.value || stateResult;
      const questions: QuestionItem[] = interruptData.questions || [];

      await prisma.project.update({
        where: { id: projectId },
        data: { openQuestions: questions as any },
      });

      return {
        success: true,
        data: {
          success: true,
          status: "NEEDS_INPUT",
          questions,
        },
      };
    }

    const synthesis = stateResult.result;
    if (!synthesis) {
      return await analyzeProjectAction(projectId, answers);
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          problemStatement: synthesis.problemStatement,
          techStack: synthesis.suggestedStack,
          requirements: {
            functional: synthesis.functionalRequirements,
            nonFunctional: synthesis.nonFunctionalRequirements,
          },
          openQuestions: Prisma.DbNull,
          status: "ARCHITECTURE",
        },
      });

      await tx.feature.deleteMany({ where: { projectId } });
      await tx.decision.deleteMany({ where: { projectId } });

      if (synthesis.suggestedStack.length > 0) {
        await tx.feature.createMany({
          data: [
            {
              projectId,
              title: "Core System Infrastructure & Authentication",
              description: `Initial architecture stack setup with ${synthesis.suggestedStack.slice(0, 3).join(", ")}.`,
              phase: "MVP",
              status: "planned",
            },
            {
              projectId,
              title: "Primary Relational Data Schema",
              description: "Database models, indexes, and single-tenant ownership constraints.",
              phase: "MVP",
              status: "planned",
            },
          ],
        });

        await tx.decision.create({
          data: {
            projectId,
            decision: `Selected initial core stack: ${synthesis.suggestedStack.join(", ")}`,
            reasoning: `Applied user technical choices: ${Object.entries(answers).map(([k, v]) => `${k}:${v}`).join(", ")}`,
            alternative: "Monolithic framework",
            affectedAreas: ["Architecture", "Database", "Security"],
          },
        });
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { success: true, status: "COMPLETED" } };
  } catch (error: any) {
    console.error("Error in resumeProjectSynthesisAction:", error);
    return await analyzeProjectAction(projectId, answers);
  }
}

/**
 * ForgeFlow Agent AI Chat Action grounded in live project state
 */
export async function sendChatMessageAction(
  projectId: string,
  userMessageContent: string
): Promise<ActionResult<{ userMessageId: string; assistantContent: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to use ForgeFlow Agent Copilot" },
    };
  }

  // Quota Guard Check
  const quotaCheck = await checkUserAiQuotaAction(userId);
  if (!quotaCheck.allowed) {
    return {
      success: false,
      error: quotaCheck.error!,
    };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      include: {
        features: true,
        decisions: true,
        roadmapItems: { orderBy: { order: "asc" } },
      },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    let session = await prisma.chatSession.findFirst({
      where: { projectId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { projectId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: userMessageContent,
      },
    });

    // ── Tavily Research Optional ──────────────────────────────────────────
    let tavilyContext = "";
    const lowerQuery = userMessageContent.toLowerCase();
    const shouldSearchWeb =
      lowerQuery.includes("latest") ||
      lowerQuery.includes("search") ||
      lowerQuery.includes("vs") ||
      lowerQuery.includes("compare") ||
      lowerQuery.includes("benchmark");

    if (shouldSearchWeb && process.env.TAVILY_API_KEY) {
      const tavilyCheck = await checkUserTavilyQuotaAction(userId);
      if (tavilyCheck.allowed) {
        try {
          const tavilyRes = await searchTavily(`${project.name} ${userMessageContent}`);
          if (tavilyRes.results && tavilyRes.results.length > 0) {
            tavilyContext = `\n\n### Live Web Research Findings:\n` +
              tavilyRes.results
                .slice(0, 2)
                .map((r) => `- **[${r.title}](${r.url})**: ${r.content}`)
                .join("\n");
          }
          await logAiUsageAction({
            userId,
            projectId,
            operation: "web_search",
            provider: "tavily",
            model: "tavily-basic",
            totalTokens: 1,
            status: "success",
          });
        } catch (err) {
          console.warn("Tavily search skipped inside ForgeFlow Agent:", err);
        }
      } else {
        tavilyContext = `\n\n*(Note: Live Tavily web search was skipped because your monthly web research credit limit was reached. Tavily credits reset on the 1st of next month.)*`;
      }
    }

    const techStack = Array.isArray(project.techStack) ? (project.techStack as string[]) : [];
    const assumptions = Array.isArray(project.assumptions) ? (project.assumptions as string[]) : [];

    const systemPromptText = buildChatSystemPrompt({
      projectId: project.id,
      projectName: project.name,
      ideaText: project.ideaText,
      problemStatement: project.problemStatement,
      techStack,
      requirements: project.requirements,
      featureCount: project.features.length,
      decisions: project.decisions,
      roadmapItems: project.roadmapItems,
      assumptions,
      openQuestions: project.openQuestions,
      tavilyContext,
    });

    const conversationHistory = session.messages.slice(-6).map((m) => {
      if (m.role === "user") return new HumanMessage(m.content);
      return new AIMessage(m.content);
    });

    const assistantReply = await invokeLlmWithFallback(
      [
        new SystemMessage(systemPromptText),
        ...conversationHistory,
        new HumanMessage(userMessageContent),
      ],
      { userId, projectId, operation: "chat" }
    );

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: assistantReply,
      },
    });

    const chatProviderName = getLlmProvider();
    await logAiUsageAction({
      userId,
      projectId,
      operation: "chat",
      provider: chatProviderName,
      model: chatProviderName === "groq" ? getGroqModel() : getGeminiModel(),
      promptTokens: 350,
      completionTokens: 250,
      totalTokens: 600,
      status: "success",
    });

    return {
      success: true,
      data: {
        userMessageId: userMessage.id,
        assistantContent: assistantReply,
      },
    };
  } catch (error: any) {
    console.error("Error in sendChatMessageAction:", error);
    return {
      success: false,
      error: { code: "AI_ERROR", message: `AI Assistant Error: ${error?.message || "Failed to generate AI response."}` },
    };
  }
}

/**
 * Server action to explicitly ACCEPT a proposed project change
 */
export async function acceptProposalAction(
  projectId: string,
  proposal: ProposalPayload
): Promise<ActionResult<{ success: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found" } };
    }

    const previousValue = (project as any)[proposal.targetField];

    await prisma.$transaction(async (tx) => {
      // Update target field
      await tx.project.update({
        where: { id: projectId },
        data: {
          [proposal.targetField]: proposal.newValue,
        },
      });

      // Log decision record
      await tx.decision.create({
        data: {
          projectId,
          decision: `ForgeFlow Agent Proposal Accepted: ${proposal.summary}`,
          reasoning: proposal.reasoning || `User explicitly accepted proposal to update ${proposal.targetField}.`,
          affectedAreas: proposal.affectedAreas,
        },
      });
    });

    // Write audit event with before and after state
    await logAuditEventAction({
      userId,
      projectId,
      action: "PROPOSAL_ACCEPTED",
      metadata: {
        proposalType: proposal.type,
        targetField: proposal.targetField,
        previousValue,
        newValue: proposal.newValue,
        summary: proposal.summary,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/architecture`);
    revalidatePath(`/projects/${projectId}/documents`);

    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in acceptProposalAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to apply proposal." } };
  }
}
