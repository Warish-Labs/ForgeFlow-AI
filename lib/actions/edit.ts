"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * Update core project metadata (Name, Vision, Problem Statement)
 */
export async function updateProjectMetadataAction(
  projectId: string,
  input: { name?: string; ideaText?: string; problemStatement?: string }
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found or access denied" } };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.ideaText && { ideaText: input.ideaText }),
        ...(input.problemStatement !== undefined && { problemStatement: input.problemStatement }),
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/dashboard");
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateProjectMetadataAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update project metadata" } };
  }
}

/**
 * Update Tech Stack (Add, Edit, Remove items from array)
 */
export async function updateTechStackAction(
  projectId: string,
  techStack: string[]
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found or access denied" } };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { techStack },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/requirements`);
    revalidatePath(`/projects/${projectId}/architecture`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateTechStackAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update tech stack" } };
  }
}

/**
 * Update Requirements (Functional and Non-Functional arrays)
 */
export async function updateRequirementsAction(
  projectId: string,
  requirements: { functional: string[]; nonFunctional: string[] }
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found or access denied" } };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { requirements },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/requirements`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateRequirementsAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update requirements" } };
  }
}

/**
 * Update an existing Feature item
 */
export async function updateFeatureItemAction(
  projectId: string,
  featureId: string,
  input: { title?: string; description?: string; phase?: "MVP" | "PHASE_2" | "PHASE_3"; status?: string }
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found or access denied" } };
    }

    await prisma.feature.update({
      where: { id: featureId, projectId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.phase && { phase: input.phase }),
        ...(input.status && { status: input.status }),
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/features`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateFeatureItemAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update feature item" } };
  }
}

/**
 * Delete a Feature item
 */
export async function deleteFeatureItemAction(
  projectId: string,
  featureId: string
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found" } };
    }

    await prisma.feature.delete({
      where: { id: featureId, projectId },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/features`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in deleteFeatureItemAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete feature" } };
  }
}

/**
 * Update an existing ADR Decision card
 */
export async function updateDecisionAction(
  projectId: string,
  decisionId: string,
  input: { decision?: string; reasoning?: string; alternative?: string }
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found" } };
    }

    await prisma.decision.update({
      where: { id: decisionId, projectId },
      data: {
        ...(input.decision && { decision: input.decision }),
        ...(input.reasoning && { reasoning: input.reasoning }),
        ...(input.alternative !== undefined && { alternative: input.alternative }),
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/architecture`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateDecisionAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update decision" } };
  }
}

/**
 * Update an existing Roadmap item
 */
export async function updateRoadmapItemAction(
  projectId: string,
  itemId: string,
  input: { title?: string; phase?: "MVP" | "PHASE_2" | "PHASE_3"; status?: string; dependsOn?: string[] }
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found" } };
    }

    await prisma.roadmapItem.update({
      where: { id: itemId, projectId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.phase && { phase: input.phase }),
        ...(input.status && { status: input.status }),
        ...(input.dependsOn && { dependsOn: input.dependsOn }),
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/roadmap`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateRoadmapItemAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update roadmap item" } };
  }
}

/**
 * Update Open Questions and Project Assumptions
 */
export async function updateAssumptionsAndQuestionsAction(
  projectId: string,
  input: { assumptions?: string[]; openQuestions?: Array<{ question: string; answer: string }> }
): Promise<ActionResult<{ success: boolean }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found" } };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(input.assumptions !== undefined && { assumptions: input.assumptions }),
        ...(input.openQuestions !== undefined && { openQuestions: input.openQuestions }),
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/overview`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateAssumptionsAndQuestionsAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update assumptions and questions" } };
  }
}
