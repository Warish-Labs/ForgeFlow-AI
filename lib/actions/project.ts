"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import {
  createProjectSchema,
  updateProjectSchema,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/validations/project";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function createProjectAction(
  rawInput: CreateProjectInput
): Promise<ActionResult<{ id: string; name: string }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to create a project" },
    };
  }

  const parseResult = createProjectSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: issue ? issue.message : "Invalid project input" },
    };
  }

  const { name, ideaText, problemStatement, techStack } = parseResult.data;

  try {
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name,
        ideaText,
        problemStatement: problemStatement ?? null,
        techStack: techStack ?? [],
        status: "PLANNING",
      },
      select: {
        id: true,
        name: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: project };
  } catch (error) {
    console.error("Error creating project:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create project. Please try again." },
    };
  }
}

export async function getUserProjectsAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return [];
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            features: true,
            decisions: true,
            roadmapItems: true,
          },
        },
      },
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectByIdAction(projectId: string) {
  const userId = await getAuthUserId();
  if (!userId) {
    return null;
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId, // Strict ownership check
      },
      include: {
        features: true,
        decisions: {
          orderBy: { createdAt: "desc" },
        },
        roadmapItems: true,
        _count: {
          select: {
            features: true,
            decisions: true,
            roadmapItems: true,
            documents: true,
          },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    return null;
  }
}

export async function updateProjectAction(
  projectId: string,
  rawInput: UpdateProjectInput
): Promise<ActionResult<{ id: string }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to update a project" },
    };
  }

  const parseResult = updateProjectSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: issue ? issue.message : "Invalid input" },
    };
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: parseResult.data,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { id: projectId } };
  } catch (error) {
    console.error("Error updating project:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update project" },
    };
  }
}

export async function deleteProjectAction(
  projectId: string
): Promise<ActionResult<{ id: string }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to delete a project" },
    };
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: projectId } };
  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to delete project" },
    };
  }
}
