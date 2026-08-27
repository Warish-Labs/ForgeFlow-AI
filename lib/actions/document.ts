"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

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
    let content = "";

    const requirements = (project.requirements as { functional?: string[]; nonFunctional?: string[] }) || {};
    const techStack = (project.techStack as string[]) || [];
    const assumptions = (project.assumptions as string[]) || [];

    switch (docType) {
      case "PRD":
      case "REQUIREMENTS":
        content = `# ${project.name} — Requirements Specification\n\n` +
          `## Executive Vision\n${project.ideaText}\n\n` +
          `## Problem Statement\n${project.problemStatement || "Not analyzed yet."}\n\n` +
          `## Functional Requirements\n` +
          ((requirements.functional || []).map((req, i) => `${i + 1}. ${req}`).join("\n") || "No functional requirements generated yet.") + "\n\n" +
          `## Non-Functional Requirements\n` +
          ((requirements.nonFunctional || []).map((req, i) => `${i + 1}. ${req}`).join("\n") || "No non-functional requirements generated yet.");
        break;

      case "FEATURES":
        content = `# ${project.name} — Feature Specification\n\n` +
          (project.features.length > 0
            ? project.features.map((f) => `### [${f.phase}] ${f.title}\n- **Description**: ${f.description || "N/A"}\n- **Status**: ${f.status}`).join("\n\n")
            : "No features extracted yet.");
        break;

      case "STACK":
        content = `# ${project.name} — Technology Stack\n\n` +
          `## Configured Frameworks & Services\n` +
          (techStack.length > 0 ? techStack.map((tech) => `- **${tech}**`).join("\n") : "No technologies added yet.") + "\n\n" +
          `## Architecture Rationale\nTechnologies are selected to balance high scalability, low latency, and operational simplicity.`;
        break;

      case "ARCHITECTURE":
      case "ADRS":
        content = `# ${project.name} — System Architecture & ADR Log\n\n` +
          `## Architecture Overview\n${project.architectureText || "System architecture has not been generated yet."}\n\n` +
          `## Architecture Decision Records (ADRs)\n` +
          (project.decisions.length > 0
            ? project.decisions.map((d, i) => `### ADR-${i + 1}: ${d.decision}\n- **Reasoning**: ${d.reasoning}\n- **Alternative Considered**: ${d.alternative || "None"}\n- **Affected Areas**: ${d.affectedAreas.join(", ")}`).join("\n\n")
            : "No decision records generated yet.");
        break;

      case "DATABASE":
        content = `# ${project.name} — Database & Data Model\n\n` +
          `## Database System\nPrimary Persistence: **PostgreSQL** with Prisma ORM.\n\n` +
          `## Data Privacy & Isolation\nStrict single-tenant isolation enforced via mandatory \`ownerId === auth().userId\` queries on all entity models.\n\n` +
          `## Core Entities\n- **Project Blueprint**: Stores vision, problem statement, requirements, and stack.\n- **Feature**: Release milestone feature backlog.\n- **Decision**: Architecture Decision Record (ADR) history.`;
        break;

      case "SECURITY":
        content = `# ${project.name} — Security Architecture\n\n` +
          `## Single-Tenant Owner Isolation\nEvery database model includes an explicit \`ownerId\` field corresponding to the authenticated Clerk user identity.\n\n` +
          `## Zero-Unvalidated LLM Output Protection\nAll LLM responses must pass JSON cleaning and strict Zod schema validation before writing to PostgreSQL.`;
        break;

      case "ROADMAP":
        content = `# ${project.name} — Implementation Roadmap\n\n` +
          (project.roadmapItems.length > 0
            ? project.roadmapItems.map((r, i) => `### ${i + 1}. [${r.phase}] ${r.title}\n- **Status**: ${r.status}\n- **Prerequisites**: ${r.dependsOn.length > 0 ? r.dependsOn.join(", ") : "None"}`).join("\n\n")
            : "No roadmap items generated yet.");
        break;

      case "BLUEPRINT":
      default:
        content = `# ${project.name} — Technical Implementation Blueprint\n\n` +
          `## 1. Vision & Idea\n${project.ideaText}\n\n` +
          `## 2. Problem Statement\n${project.problemStatement || "Not specified."}\n\n` +
          `## 3. Technology Stack\n` + (techStack.map((s) => `- ${s}`).join("\n") || "Not set") + "\n\n" +
          `## 4. Functional Requirements\n` + ((requirements.functional || []).map((r, i) => `${i + 1}. ${r}`).join("\n") || "None") + "\n\n" +
          `## 5. Non-Functional Requirements\n` + ((requirements.nonFunctional || []).map((r, i) => `${i + 1}. ${r}`).join("\n") || "None") + "\n\n" +
          `## 6. Architecture Decision Log\n` + (project.decisions.map((d) => `- **${d.decision}**: ${d.reasoning}`).join("\n") || "None") + "\n\n" +
          `## 7. Implementation Roadmap\n` + (project.roadmapItems.map((r) => `- [${r.phase}] ${r.title}`).join("\n") || "None");
        break;
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
          content,
          version: existingDoc.version + 1,
          status: "Generated",
        },
      });
    } else {
      doc = await prisma.document.create({
        data: {
          projectId,
          type: docType,
          title,
          content,
          version: 1,
          status: "Generated",
        },
      });
    }

    revalidatePath(`/projects/${projectId}/documents`);
    return { success: true, data: { documentId: doc.id, content: doc.content } };
  } catch (error: any) {
    console.error("Error in generateDocumentAction:", error);
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate document" } };
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
