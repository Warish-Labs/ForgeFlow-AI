"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { checkUserAiQuotaAction, logAiUsageAction } from "@/lib/services/quota";
import { ActionResult } from "@/lib/actions/ai";
import { invokeLlmWithFallback, cleanJsonText, getGroqModel, getGeminiModel, getLlmProvider } from "@/lib/ai/provider";
import { designSpecSchema, DesignSpec } from "@/lib/validations/design";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export interface GenerateDesignInput {
  markdown?: string;
  presets?: {
    visualStyle?: string;
    theme?: string;
    accent?: string;
    density?: string;
    corners?: string;
    typography?: string;
    layout?: string;
  };
}

export async function generateUiDesignAction(
  projectId: string,
  input: GenerateDesignInput
): Promise<ActionResult<DesignSpec>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required to generate UI design" },
    };
  }

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

    const systemPrompt = `You are a Principal UI/UX Design Systems Architect.
Synthesize a comprehensive, modern UI Design Specification for the software project based on the input guidelines or presets.

Return ONLY a valid JSON object matching this EXACT schema:
{
  "themeName": "Descriptive theme name (e.g. Obsidian Neon)",
  "visualStyle": "Visual style name (e.g. Developer Tool / Glassmorphism)",
  "palette": [
    { "name": "Background Canvas", "hex": "#070A14", "role": "App Root Surface" },
    { "name": "Primary Accent", "hex": "#1060EE", "role-[#1060EE]": "Main Interactive CTAs" },
    { "name": "Secondary Highlight", "hex": "#38B6FF", "role": "Badges & Active States" },
    { "name": "Success Mint", "hex": "#2FE6B0", "role": "Validated Badges & Status" }
  ],
  "typography": {
    "fontFamily": "Primary Sans font family stack",
    "accentFont": "Monospace accent font stack"
  },
  "components": [
    {
      "name": "Navigation Bar Rail",
      "type": "navigation",
      "spec": "Component layout, padding, borders, and hover micro-animations",
      "cssSnippet": "border-b border-[#1b2338] bg-[#0d1220] backdrop-blur-md"
    }
  ],
  "presetTags": ["Dark Mode", "Developer Tool", "Electric Blue"]
}`;

    const userPrompt = `Project Name: ${project.name}
Software Vision: ${project.ideaText}
Problem Statement: ${project.problemStatement || "N/A"}

User Supplied Markdown Spec:
${input.markdown || "None provided"}

User Selected Design Presets:
${JSON.stringify(input.presets || {}, null, 2)}`;

    const rawRes = await invokeLlmWithFallback(
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      { userId, projectId, operation: "design" }
    );

    const cleaned = cleanJsonText(rawRes);
    const parsed = JSON.parse(cleaned);
    const validatedSpec = designSpecSchema.parse(parsed);

    // Save design spec metadata inside project architecture JSON
    const currentArch = (project.architecture as Record<string, any>) || {};
    await prisma.project.update({
      where: { id: projectId },
      data: {
        architecture: {
          ...currentArch,
          designSpec: validatedSpec,
        },
      },
    });

    const providerName = getLlmProvider();
    await logAiUsageAction({
      userId,
      projectId,
      operation: "design",
      provider: providerName,
      model: providerName === "groq" ? getGroqModel() : getGeminiModel(),
      promptTokens: 700,
      completionTokens: 600,
      totalTokens: 1300,
      durationMs: Date.now() - startTime,
      status: "success",
    });

    revalidatePath(`/projects/${projectId}/design`);
    return { success: true, data: validatedSpec };
  } catch (error: any) {
    console.error("[AI] Error in generateUiDesignAction:", error);
    const msg = error?.message || String(error);
    return {
      success: false,
      error: {
        code: "AI_DESIGN_ERROR",
        operation: "design",
        message: msg.includes("Failed:") ? msg : `Failed to synthesize UI design: ${msg}`,
      },
    };
  }
}
