"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { architectureSynthesisNode } from "@/lib/ai/nodes/architectureNode";
import { checkUserAiQuotaAction, logAiUsageAction } from "@/lib/services/quota";
import { ActionResult } from "@/lib/actions/ai";

import { getGroqModel, getGeminiModel, getLlmProvider } from "@/lib/ai/provider";

/**
  * Run Architecture Synthesis to generate ADRs and System Topology
  */
export async function generateArchitectureAction(
  projectId: string
): Promise<ActionResult<{ success: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
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

    const techStack = Array.isArray(project.techStack)
      ? (project.techStack as string[])
      : [];

    const synthResult = await architectureSynthesisNode({
      projectName: project.name,
      ideaText: project.ideaText,
      problemStatement: project.problemStatement,
      techStack,
      requirements: project.requirements,
    });

    await prisma.$transaction(async (tx) => {
      // Clear old decisions for fresh synthesis
      await tx.decision.deleteMany({
        where: { projectId },
      });

      // Insert new Architecture Decision Records (ADRs)
      for (const dec of synthResult.decisions) {
        await tx.decision.create({
          data: {
            projectId,
            decision: dec.decision,
            reasoning: dec.reasoning,
            alternative: dec.alternative || null,
            affectedAreas: dec.affectedAreas,
          },
        });
      }

      // Save system topology components & data models to Project architecture JSON
      await tx.project.update({
        where: { id: projectId },
        data: {
          architecture: {
            overview: synthResult.overview,
            components: synthResult.components,
            dataModels: synthResult.dataModels,
          },
          status: "ROADMAP_READY",
        },
      });

    });

    const providerName = getLlmProvider();
    await logAiUsageAction({
      userId,
      projectId,
      operation: "architecture",
      provider: providerName,
      model: providerName === "groq" ? getGroqModel() : getGeminiModel(),
      promptTokens: 1000,
      completionTokens: 800,
      totalTokens: 1800,
      durationMs: Date.now() - startTime,
      status: "success",
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/architecture`);
    revalidatePath("/dashboard");

    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in generateArchitectureAction:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to generate system architecture" },
    };
  }
}
