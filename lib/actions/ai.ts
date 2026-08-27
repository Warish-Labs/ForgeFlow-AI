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

/**
 * Checks if a user query is an off-topic general coding request unrelated to project planning/architecture
 */
function isOffTopicQuery(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Pattern detection for generic code requests unrelated to project architecture
  const offTopicPatterns = [
    /\bwrite a python calculator\b/i,
    /\bbuild me a react game\b/i,
    /\bgenerate a java dsa\b/i,
    /\bwrite a generic python\b/i,
    /\bwrite an? email\b/i,
    /\bcalculator program\b/i,
    /\btic tac toe\b/i,
    /\bsnake game\b/i,
    /\bsolve my homework\b/i,
  ];

  if (offTopicPatterns.some((pattern) => pattern.test(q))) {
    return true;
  }

  // General coding generation requests lacking any software architecture context
  const genericCodePrefixes = [
    "write a python script to ",
    "write a python program that ",
    "create a simple calculator",
    "build me a snake game",
    "write a C++ program",
  ];

  return genericCodePrefixes.some((prefix) => q.startsWith(prefix));
}

const OFF_TOPIC_REFUSAL_MESSAGE =
  "I am ForgeFlow's project architecture assistant. I can help with this project's requirements, features, architecture, technology decisions, roadmap, database design, and documentation, but I cannot act as a general coding assistant.";

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

      await tx.feature.deleteMany({
        where: { projectId },
      });

      await tx.feature.createMany({
        data: synthesis.extractedFeatures.map((feat) => ({
          projectId,
          title: feat.title,
          description: feat.description || null,
          phase: feat.phase,
          status: "planned",
        })),
      });

      const durationMs = Date.now() - startTime;
      await tx.aiUsageLog.create({
        data: {
          projectId,
          operation: "analyze",
          provider: process.env.LLM_PROVIDER || "groq",
          durationMs,
          status: "success",
        },
      });
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/requirements`);
    revalidatePath(`/projects/${projectId}/features`);
    revalidatePath("/dashboard");

    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in analyzeProjectAction:", error);

    try {
      await prisma.aiUsageLog.create({
        data: {
          projectId,
          operation: "analyze",
          provider: process.env.LLM_PROVIDER || "groq",
          durationMs: Date.now() - startTime,
          status: "error",
        },
      });
    } catch (_) {}

    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to run AI analysis. Please check your AI API key or try again." },
    };
  }
}

/**
 * Interactive AI Chat message handling with strict domain topic restriction guard and rich context
 */
export async function sendChatMessageAction(
  projectId: string,
  userMessageContent: string
): Promise<ActionResult<{ userMessageId: string; assistantContent: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to chat with AI" },
    };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      include: {
        features: true,
        decisions: true,
        roadmapItems: { orderBy: { order: "asc" } },
        documents: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    // Get or create active ChatSession
    let session = await prisma.chatSession.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
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

    // ── Topic Restriction Guard ─────────────────────────────────────────
    if (isOffTopicQuery(userMessageContent)) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: OFF_TOPIC_REFUSAL_MESSAGE,
        },
      });

      return {
        success: true,
        data: {
          userMessageId: userMessage.id,
          assistantContent: OFF_TOPIC_REFUSAL_MESSAGE,
        },
      };
    }

    // ── Tavily Live Search Enhancement ─────────────────────────────
    let tavilyContext = "";
    const lowerQuery = userMessageContent.toLowerCase();
    const shouldSearchWeb =
      lowerQuery.includes("latest") ||
      lowerQuery.includes("search") ||
      lowerQuery.includes("tavily") ||
      lowerQuery.includes("vs") ||
      lowerQuery.includes("compare") ||
      lowerQuery.includes("docs") ||
      lowerQuery.includes("library") ||
      lowerQuery.includes("version") ||
      lowerQuery.includes("framework") ||
      lowerQuery.includes("benchmark");

    if (shouldSearchWeb && process.env.TAVILY_API_KEY) {
      try {
        const tavilyRes = await searchTavily(`${project.name} ${userMessageContent}`);
        if (tavilyRes.results && tavilyRes.results.length > 0) {
          tavilyContext = `\n\n### Live Web Research Findings (via Tavily Search):\n` +
            tavilyRes.results
              .slice(0, 3)
              .map((r) => `- **[${r.title}](${r.url})**: ${r.content}`)
              .join("\n");
        }
      } catch (err) {
        console.warn("Tavily search execution failed inside AI chat action:", err);
      }
    }

    // Prepare LLM response with comprehensive project context
    const llm = getLlmClient();
    let assistantReply = "";

    if (llm) {
      const requirementsText = project.requirements
        ? JSON.stringify(project.requirements)
        : "No requirements extracted yet.";

      const featuresText = project.features.length > 0
        ? project.features.map((f) => `- [${f.phase}] ${f.title}: ${f.description || "N/A"}`).join("\n")
        : "No features generated yet.";

      const decisionsText = project.decisions.length > 0
        ? project.decisions.map((d) => `- ${d.decision} (Reasoning: ${d.reasoning})`).join("\n")
        : "No ADRs generated yet.";

      const roadmapText = project.roadmapItems.length > 0
        ? project.roadmapItems.map((r) => `- [${r.phase}] ${r.title} (Status: ${r.status})`).join("\n")
        : "No roadmap generated yet.";

      const assumptionsText = project.assumptions ? JSON.stringify(project.assumptions) : "None specified";
      const openQuestionsText = project.openQuestions ? JSON.stringify(project.openQuestions) : "None specified";

      const systemPrompt = `You are ForgeFlow AI, an expert software architecture copilot.
You are assisting the owner of project "${project.name}".

=== ACTIVE PROJECT CONTEXT ===
- Project ID: ${project.id}
- Vision Idea: ${project.ideaText}
- Problem Statement: ${project.problemStatement || "Not analyzed yet"}
- Target Stack: ${JSON.stringify(project.techStack || [])}
- Requirements: ${requirementsText}
- Features:
${featuresText}
- Architecture & ADRs:
${decisionsText}
- Implementation Roadmap:
${roadmapText}
- Project Assumptions: ${assumptionsText}
- Open Questions: ${openQuestionsText}

=== GUIDANCE RULES ===
1. Answer the user's architectural, technical, or project planning question clearly using the provided project context in github-flavored markdown.
2. If the user asks about technology choices (e.g. why PostgreSQL or Redis was chosen), refer to the ADR decision log.
3. If any key requirement or architectural constraint is missing or underspecified, proactively ask 1-2 targeted clarifying questions.
4. Keep replies focused, professional, and directly grounded in the project state.`;

      const conversationHistory = session.messages.slice(-8).map((m) => {
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
        console.error("LLM Provider error in sendChatMessageAction:", llmError);
        assistantReply = `**ForgeFlow AI Architecture Assistant (Offline Mode)**\n\nRegarding your question about **"${userMessageContent}"** for **${project.name}**:\n\n- **Project Vision**: ${project.ideaText.slice(0, 100)}...\n- **Target Stack**: ${JSON.stringify(project.techStack || [])}\n- **Architecture Rationale**: Architectural decisions prioritize single-tenant data isolation, relational data consistency, and strict schema validation.`;
      }
    } else {
      assistantReply = `**ForgeFlow AI Architecture Assistant**\n\nRegarding your question about **"${userMessageContent}"** for project **${project.name}**:\n\n1. **Architecture Strategy**: Based on your vision, we recommend leveraging clean modular boundaries.\n2. **Security**: Enforce strict single-tenant user ownership validation (\`ownerId === auth().userId\`).\n3. **State Persistence**: All project blueprints are centrally stored in PostgreSQL with Zod schema guards before DB insertion.`;
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
      error: { code: "INTERNAL_ERROR", message: "Failed to process chat message. Please try again." },
    };
  }
}
