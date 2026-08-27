"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createSynthesisGraph } from "@/lib/ai/graph";
import { getLlmClient } from "@/lib/ai/provider";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

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
    // 1. Fetch project with strict ownership check
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    // 2. Invoke LangGraph synthesis graph
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

    // 3. Update project in Prisma DB
    await prisma.$transaction(async (tx) => {
      // Update project core metadata
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

      // Clear previous auto-generated features for fresh analysis
      await tx.feature.deleteMany({
        where: { projectId },
      });

      // Bulk create new extracted features
      await tx.feature.createMany({
        data: synthesis.extractedFeatures.map((feat) => ({
          projectId,
          title: feat.title,
          description: feat.description || null,
          phase: feat.phase,
          status: "planned",
        })),
      });

      // Log AI Usage
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

    // Log failure
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
      error: { code: "INTERNAL_ERROR", message: "Failed to run AI analysis. Please try again." },
    };
  }
}

/**
  * Interactive AI Chat message handling
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

    // Prepare LLM response context
    const llm = getLlmClient();
    let assistantReply = "";

    if (llm) {
      const systemPrompt = `You are ForgeFlow AI, an expert software architecture copilot.
You are assisting the owner of the project "${project.name}".
Project Vision: ${project.ideaText}
Problem Statement: ${project.problemStatement || "Not analyzed yet"}
Target Stack: ${JSON.stringify(project.techStack || [])}
Features Count: ${project.features.length}

Answer the user's architectural or technical implementation question clearly and concisely in github-flavored markdown.`;

      const conversationHistory = session.messages.slice(-6).map((m) => {
        if (m.role === "user") return new HumanMessage(m.content);
        return new AIMessage(m.content);
      });

      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        ...conversationHistory,
        new HumanMessage(userMessageContent),
      ]);

      assistantReply = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    } else {
      // Mock fallback chat response
      assistantReply = `**ForgeFlow AI Architecture Assistant**\n\nRegarding your question about **"${userMessageContent}"** for project **${project.name}**:\n\n1. **Architecture Strategy**: Based on your vision (${project.ideaText.slice(0, 80)}...), we recommend leveraging clean modular boundaries.\n2. **Security**: Enforce strict single-tenant user ownership validation on every Server Action and API endpoint.\n3. **State Management**: Keep your primary project blueprints stored centrally in PostgreSQL with Zod schema guards before DB insertion.`;
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
      error: { code: "INTERNAL_ERROR", message: "Failed to process chat message" },
    };
  }
}
