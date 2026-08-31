"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { checkUserAiQuotaAction, logAiUsageAction } from "@/lib/services/quota";
import { logAuditEventAction } from "@/lib/services/audit";
import { invokeLlmWithFallback, cleanMarkdownText, getGroqModel, getGeminiModel, getLlmProvider } from "@/lib/ai/provider";
import { buildDocumentSystemPrompt } from "@/lib/ai/prompts/document";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; category?: string; operation?: string } };

export type DocumentType =
  | "PRD"
  | "REQUIREMENTS"
  | "FEATURES"
  | "STACK"
  | "ARCHITECTURE"
  | "ADRS"
  | "DATABASE"
  | "SECURITY"
  | "ROADMAP"
  | "BLUEPRINT";

const DOCUMENT_TITLES: Record<DocumentType, string> = {
  PRD: "Product Requirements Document (PRD)",
  REQUIREMENTS: "Functional & Non-Functional Requirements Specification",
  FEATURES: "Feature Roadmap & User Stories Specification",
  STACK: "Target Technology Stack & Dependency Guide",
  ARCHITECTURE: "System Architecture & Component Topology",
  ADRS: "Architecture Decision Log (ADRs)",
  DATABASE: "Database Entity & Data Model Specification",
  SECURITY: "Security & Single-Tenant Authorization Specification",
  ROADMAP: "Implementation Roadmap & Dependency Guide",
  BLUEPRINT: "Full Technical Project Blueprint",
};

/**
 * Generate or re-synthesize a specific document based on current saved project state
 */
export async function generateDocumentAction(
  projectId: string,
  docType: DocumentType
): Promise<ActionResult<{ documentId: string; content: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
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
      include: {
        features: true,
        decisions: true,
        roadmapItems: { orderBy: { order: "asc" } },
      },
    });

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found or access denied" } };
    }

    const title = DOCUMENT_TITLES[docType] || `${docType} Specification`;
    const requirements = (project.requirements as { functional?: string[]; nonFunctional?: string[] }) || {};
    const techStack = (project.techStack as string[]) || [];

    const promptText = buildDocumentSystemPrompt(docType, {
      projectName: project.name,
      ideaText: project.ideaText,
      problemStatement: project.problemStatement,
      techStack,
      requirements,
      features: project.features.map((f) => ({ title: f.title, description: f.description, phase: f.phase, status: f.status })),
      decisions: project.decisions.map((d) => ({ decision: d.decision, reasoning: d.reasoning, alternative: d.alternative, affectedAreas: d.affectedAreas })),
      roadmapItems: project.roadmapItems.map((r) => ({ title: r.title, phase: r.phase, status: r.status, dependsOn: r.dependsOn })),
      architecture: project.architecture as any,
    });

    let content = "";
    const hasKeys = Boolean(process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    if (hasKeys) {
      const rawRes = await invokeLlmWithFallback(
        [
          new SystemMessage(promptText),
          new HumanMessage(`Generate the complete ${title} document for ${project.name} in Markdown format.`),
        ],
        { userId, projectId, operation: "document" }
      );
      content = cleanMarkdownText(rawRes);
    } else {
      // Mock fallback for keyless offline environment
      content = `# ${title} — ${project.name}\n\n` +
        `## 1. Executive Summary\n${project.ideaText}\n\n` +
        `## 2. Problem Statement\n${project.problemStatement || "N/A"}\n\n` +
        `## 3. Technology Stack\n` + (techStack.map((t) => `- ${t}`).join("\n") || "None") + "\n\n" +
        `## 4. Requirements & Features\n` + ((requirements.functional || []).map((r, i) => `${i + 1}. ${r}`).join("\n") || "None");
    }

    // Check if document already exists for version increment
    const existingDoc = await prisma.document.findFirst({
      where: { projectId, type: docType },
    });

    let doc;
    if (existingDoc) {
      doc = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          title: title || `${docType} Specification`,
          content,
          version: existingDoc.version + 1,
          status: "Generated",
        },
      });
    } else {
      doc = await prisma.document.create({
        data: {
          projectId,
          ownerId: userId,
          type: docType,
          title: title || `${docType} Specification`,
          content,
          version: 1,
          status: "Generated",
        },
      });
    }

    const providerName = getLlmProvider();
    await logAiUsageAction({
      userId,
      projectId,
      operation: "document",
      provider: providerName,
      model: providerName === "groq" ? getGroqModel() : getGeminiModel(),
      promptTokens: 600,
      completionTokens: 500,
      totalTokens: 1100,
      durationMs: Date.now() - startTime,
      status: "success",
    });

    await logAuditEventAction({
      userId,
      projectId,
      action: "DOCUMENT_GENERATED",
      metadata: { docType, title: doc.title },
    });

    revalidatePath(`/projects/${projectId}/documents`);
    return { success: true, data: { documentId: doc.id, content: doc.content } };
  } catch (error: any) {
    console.error("[AI] Error in generateDocumentAction:", error);
    const msg = error?.message || String(error);
    return {
      success: false,
      error: {
        code: "AI_DOCUMENT_ERROR",
        operation: "document",
        message: msg.includes("Failed:") ? msg : `Failed to generate document: ${msg}`,
      },
    };
  }
}

/**
 * Edit Markdown content of an existing document
 */
export async function updateDocumentContentAction(
  documentId: string,
  content: string
): Promise<ActionResult<{ success: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const existing = await prisma.document.findFirst({
      where: { id: documentId, project: { ownerId: userId } },
    });

    if (!existing) {
      return { success: false, error: { code: "NOT_FOUND", message: "Document not found or access denied" } };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        content,
        status: "Edited",
      },
    });

    await logAuditEventAction({
      userId,
      projectId: existing.projectId,
      action: "DOCUMENT_EDITED",
      metadata: { documentId, type: existing.type },
    });

    revalidatePath(`/projects/${existing.projectId}/documents`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in updateDocumentContentAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update document content" } };
  }
}

/**
 * Delete a document specification
 */
export async function deleteDocumentAction(
  documentId: string
): Promise<ActionResult<{ success: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } };
  }

  try {
    const existing = await prisma.document.findFirst({
      where: { id: documentId, project: { ownerId: userId } },
    });

    if (!existing) {
      return { success: false, error: { code: "NOT_FOUND", message: "Document not found or access denied" } };
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    revalidatePath(`/projects/${existing.projectId}/documents`);
    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in deleteDocumentAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete document" } };
  }
}

/**
 * Fetch all documents associated with a project
 */
export async function getProjectDocumentsAction(projectId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  return await prisma.document.findMany({
    where: {
      projectId,
      project: { ownerId: userId },
    },
    orderBy: { createdAt: "desc" },
  });
}
