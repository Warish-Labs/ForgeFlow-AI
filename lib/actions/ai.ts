"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createSynthesisGraph } from "@/lib/ai/graph";
import { getLlmClient } from "@/lib/ai/provider";
import { searchTavily } from "@/lib/tools/tavily";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export interface ProposalPayload {
  type: "STACK_CHANGE" | "REQUIREMENT_UPDATE" | "ROADMAP_UPDATE" | "GENERAL_UPDATE";
  summary: string;
  targetField: "techStack" | "requirements" | "problemStatement" | "assumptions";
  newValue: any;
  affectedAreas: string[];
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

/**
 * Run AI Requirement Synthesis on a project
 */
export async function analyzeProjectAction(projectId: string): Promise<ActionResult<{ success: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to analyze a project" },
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
    const stateResult = await graph.invoke({
      projectId: project.id,
      projectName: project.name,
      ideaText: project.ideaText,
    });

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

    await prisma.aiUsageLog.create({
      data: {
        projectId,
        operation: "analyze",
        provider: process.env.LLM_PROVIDER || "groq",
        durationMs: Date.now() - startTime,
        status: "success",
      },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in analyzeProjectAction:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to analyze project. Please try again." },
    };
  }
}

/**
 * Anvil AI Chat Agent Action with strict boundary fallback and proposal generation
 */
export async function sendChatMessageAction(
  projectId: string,
  userMessageContent: string
): Promise<ActionResult<{ userMessageId: string; assistantContent: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to use Anvil Copilot" },
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

    // ── Strict Out of Scope Boundary Check ────────────────────────────────
    if (isOutofScopeQuery(userMessageContent)) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: OUT_OF_SCOPE_FALLBACK,
        },
      });

      return {
        success: true,
        data: {
          userMessageId: userMessage.id,
          assistantContent: OUT_OF_SCOPE_FALLBACK,
        },
      };
    }

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
      try {
        const tavilyRes = await searchTavily(`${project.name} ${userMessageContent}`);
        if (tavilyRes.results && tavilyRes.results.length > 0) {
          tavilyContext = `\n\n### Live Web Research Findings:\n` +
            tavilyRes.results
              .slice(0, 2)
              .map((r) => `- **[${r.title}](${r.url})**: ${r.content}`)
              .join("\n");
        }
      } catch (err) {
        console.warn("Tavily search skipped inside Anvil:", err);
      }
    }

    const llm = getLlmClient();
    let assistantReply = "";

    const stackList = (project.techStack as string[]) || [];
    const requirementsText = project.requirements
      ? JSON.stringify(project.requirements)
      : "No requirements extracted yet.";

    const systemPrompt = `You are Anvil, the in-app AI agent for ForgeFlow AI. You help with THIS project only — its requirements, tech stack, architecture, roadmap, and decision log — and with how to use ForgeFlow itself.

=== ACTIVE PROJECT CONTEXT ===
- Project ID: ${project.id}
- Name: ${project.name}
- Vision Idea: ${project.ideaText}
- Problem Statement: ${project.problemStatement || "Not specified"}
- Target Stack: ${JSON.stringify(stackList)}
- Requirements: ${requirementsText}
- Feature Count: ${project.features.length}
- Decision Records (ADRs): ${project.decisions.length}
- Roadmap Milestone Count: ${project.roadmapItems.length}
${tavilyContext}

Navigation map:
- Overview      → /projects/${project.id}
- Requirements  → /projects/${project.id}/requirements
- Architecture  → /projects/${project.id}/architecture
- Roadmap       → /projects/${project.id}/roadmap
- Decisions     → /projects/${project.id}/decisions
- Documents     → /projects/${project.id}/documents
- Settings      → /projects/${project.id}/settings

FORMATTING & RESPONSE RULES:
1. Always format responses in clean GitHub Markdown using headers (\`### Section Title\`), bold highlights (\`**keyword**\`), bullet lists (\`- point\`), and inline code tags (\`\` \`Next.js\` \`\`\`).
2. Provide direct, non-repetitive answers tailored specifically to what the user asked. NEVER output generic repetitive templates.
3. If the user asks to modify project state (e.g. change tech stack, add frameworks, update vision), restate your recommendation and append a JSON block at the very end of your response formatted EXACTLY like this:
   \`\`\`json
   {
     "type": "STACK_CHANGE",
     "summary": "Change tech stack to include React.js and Node.js",
     "targetField": "techStack",
     "newValue": ["React.js", "Node.js", "PostgreSQL"],
     "affectedAreas": ["Architecture Topology", "Document Specs"]
   }
   \`\`\`
4. If you need clarification from the user to make a decision, append a JSON block formatted like this:
   \`\`\`json
   {
     "type": "CLARIFICATION_NEEDED",
     "question": "Which database engine would you prefer for session storage?",
     "options": ["Redis", "PostgreSQL", "MongoDB"]
   }
   \`\`\`

You must not answer anything outside this project scope — general knowledge, cooking recipes, generic non-project coding requests. If asked, reply with EXACTLY: "I'm not able to understand that question." Nothing more.`;

    if (llm) {
      const conversationHistory = session.messages.slice(-6).map((m) => {
        if (m.role === "user") return new HumanMessage(m.content);
        return new AIMessage(m.content);
      });

      try {
        const response = await llm.invoke([
          new SystemMessage(systemPrompt),
          ...conversationHistory,
          new HumanMessage(userMessageContent),
        ]);

        assistantReply = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      } catch (llmError: any) {
        console.error("LLM Provider error in Anvil chat action:", llmError);

        // Check if user is asking to change stack in offline mode
        if (lowerQuery.includes("change") && lowerQuery.includes("stack")) {
          assistantReply = `I understand you want to modify the tech stack for **${project.name}**.\n\nHere is the proposal for your review:\n\n\`\`\`json\n{\n  "type": "STACK_CHANGE",\n  "summary": "Update target technology stack based on user request",\n  "targetField": "techStack",\n  "newValue": ["React.js", "Node.js", "PostgreSQL"],\n  "affectedAreas": ["Architecture Topology", "Exported Documents"]\n}\n\`\`\``;
        } else {
          assistantReply = `Regarding your question about **"${userMessageContent}"** for **${project.name}**:\n\n- **Project Vision**: ${project.ideaText}\n- **Current Tech Stack**: ${JSON.stringify(stackList)}\n\nYou can view your system architecture at [Architecture Specs](/projects/${project.id}/architecture).`;
        }
      }
    } else {
      assistantReply = `Regarding your question about **"${userMessageContent}"**:\n\n- **Project**: ${project.name}\n- **Current Stack**: ${JSON.stringify(stackList)}\n\nYou can manage settings at [Project Overview](/projects/${project.id}).`;
    }

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: assistantReply,
      },
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
      error: { code: "INTERNAL_ERROR", message: "Failed to process chat message." },
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
          decision: `Anvil Proposal Accepted: ${proposal.summary}`,
          reasoning: `User explicitly accepted proposal to update ${proposal.targetField}.`,
          affectedAreas: proposal.affectedAreas,
        },
      });
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
