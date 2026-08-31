"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { roadmapSynthesisNode } from "@/lib/ai/nodes/roadmapNode";
import { checkUserAiQuotaAction, logAiUsageAction } from "@/lib/services/quota";
import { ActionResult } from "@/lib/actions/ai";
import { getGroqModel, getGeminiModel, getLlmProvider } from "@/lib/ai/provider";

/**
  * Run Roadmap Synthesis to generate sequential milestone items
  */
export async function generateRoadmapAction(
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
      include: { features: true, decisions: true },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or access denied" },
      };
    }

    const projAny = project as any;
    const featuresList = projAny.features || [];
    const decisionsList = projAny.decisions || [];

    const synthResult = await roadmapSynthesisNode({
      projectName: project.name,
      ideaText: project.ideaText,
      features: featuresList,
      decisions: decisionsList,
    });

    await prisma.$transaction(async (tx) => {
      // Delete old roadmap items
      await tx.roadmapItem.deleteMany({
        where: { projectId },
      });

      // Create new roadmap items
      for (let i = 0; i < synthResult.items.length; i++) {
        const item = synthResult.items[i];
        await tx.roadmapItem.create({
          data: {
            projectId,
            title: item.title,
            phase: item.phase,
            status: item.status || "todo",
            order: i + 1,
            dependsOn: item.dependsOn || [],
          },
        });
      }

      // Update project status to EXPORTED / EXPORT_READY
      await tx.project.update({
        where: { id: projectId },
        data: { status: "EXPORTED" },
      });

    });

    const providerName = getLlmProvider();
    await logAiUsageAction({
      userId,
      projectId,
      operation: "roadmap",
      provider: providerName,
      model: providerName === "groq" ? getGroqModel() : getGeminiModel(),
      promptTokens: 900,
      completionTokens: 700,
      totalTokens: 1600,
      durationMs: Date.now() - startTime,
      status: "success",
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/roadmap`);
    revalidatePath("/dashboard");

    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error in generateRoadmapAction:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to generate roadmap milestones" },
    };
  }
}

/**
  * Export complete software blueprint as a formatted Markdown document
  */
export async function exportBlueprintMarkdownAction(
  projectId: string
): Promise<ActionResult<{ filename: string; content: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
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

    const projAny = project as any;
    const decisionsList: any[] = projAny.decisions || [];
    const roadmapItemsList: any[] = projAny.roadmapItems || [];

    const reqObj = (project.requirements as { functional?: string[]; nonFunctional?: string[] }) || {};
    const functionalReqs = reqObj.functional || [];
    const nonFunctionalReqs = reqObj.nonFunctional || [];
    const stackList = Array.isArray(project.techStack) ? (project.techStack as string[]) : [];

    const archObj = (project.architecture as {
      overview?: string;
      components?: { name: string; type: string; description: string; tech: string }[];
      dataModels?: { entity: string; description: string; fields: string[] }[];
    }) || {};

    const markdown = `# ${project.name} — Technical Architecture & Implementation Blueprint

> [!NOTE]
> **ForgeFlow AI Engine Synthesis** · Status: \`${project.status}\` · Generated: ${new Date(project.createdAt).toLocaleDateString()}

---

## 1. Executive Summary & Vision
${project.ideaText}

${project.problemStatement ? `> [!IMPORTANT]\n> **Core Problem Statement**:\n> ${project.problemStatement}\n` : ""}

---

## 2. Technology Stack
${stackList.length > 0 ? stackList.map((t) => `- **${t}**`).join("\n") : "- **Framework**: Next.js 16 (TypeScript)\n- **Database**: PostgreSQL (Prisma ORM)\n- **Authentication**: Clerk RBAC\n- **AI Engine**: Groq Llama 3.3 70B & Gemini 2.5"}

---

## 3. Requirement Synthesis

### Functional Requirements
${functionalReqs.length > 0 ? functionalReqs.map((r, i) => `${i + 1}. ${r}`).join("\n") : "No functional requirements recorded."}

### Non-Functional Requirements
${nonFunctionalReqs.length > 0 ? nonFunctionalReqs.map((r, i) => `${i + 1}. ${r}`).join("\n") : "No non-functional requirements recorded."}

---

## 4. System Architecture & Topology

${archObj.overview ? `> [!TIP]\n> **Topology Overview**:\n> ${archObj.overview}\n` : ""}

### System Components
${
  archObj.components && archObj.components.length > 0
    ? `| Component Name | Type | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
` +
      archObj.components
        .map(
          (c) =>
            `| **${c.name}** | \`${c.type}\` | ${c.description} | \`${c.tech}\` |`
        )
        .join("\n")
    : "Components not synthesized."
}

### Data Entity Models
${
  archObj.dataModels && archObj.dataModels.length > 0
    ? archObj.dataModels
        .map(
          (m) =>
            `#### Entity: ${m.entity}\n${m.description}\n- Fields: \`${m.fields.join("`, `")}\`\n`
        )
        .join("\n")
    : "Data models not synthesized."
}

---

## 5. Architecture Decision Records (ADRs)
${
  decisionsList.length > 0
    ? `| ADR ID | Decision Summary | Reasoning / Rationale | Impact Areas |
| :--- | :--- | :--- | :--- |
` +
      decisionsList
        .map(
          (d: any, i: number) =>
            `| **ADR-${i + 1}** | ${d.decision} | ${d.reasoning} | \`${(d.affectedAreas || []).join("`, `")}\` |`
        )
        .join("\n")
    : "No ADRs recorded."
}

---

## 6. Implementation Roadmap & Delivery Milestones
${
  roadmapItemsList.length > 0
    ? `| Phase | Milestone Task | Status | Prerequisites |
| :--- | :--- | :--- | :--- |
` +
      roadmapItemsList
        .map(
          (item: any) =>
            `| \`${item.phase}\` | **${item.title}** | \`${(item.status || "todo").toUpperCase()}\` | ${
              item.dependsOn && item.dependsOn.length > 0
                ? item.dependsOn.join(", ")
                : "None"
            } |`
        )
        .join("\n")
    : "Roadmap items not scheduled."
}

---
*End of Blueprint — Synthesized autonomously by ForgeFlow AI.*
`;

    const sanitizeFilename = project.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `${sanitizeFilename}-blueprint.md`;

    return {
      success: true,
      data: { filename, content: markdown },
    };
  } catch (error: any) {
    console.error("Error in exportBlueprintMarkdownAction:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to export blueprint markdown" },
    };
  }
}
