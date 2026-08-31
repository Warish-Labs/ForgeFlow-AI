import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import {
  getLlmClient,
  cleanJsonText,
  generateMockRoadmapSynthesis,
  invokeLlmWithFallback,
} from "../provider";
import {
  roadmapSynthesisSchema,
  RoadmapSynthesisResult,
} from "@/lib/validations/roadmap";

export interface RoadmapNodeInput {
  projectName: string;
  ideaText: string;
  features?: { title: string }[];
  decisions?: { decision: string }[];
}

export async function roadmapSynthesisNode(
  input: RoadmapNodeInput
): Promise<RoadmapSynthesisResult> {
  const { projectName, ideaText, features = [], decisions = [] } = input;
  const hasKeys = Boolean(process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (!hasKeys) {
    return generateMockRoadmapSynthesis(projectName);
  }

  const systemPrompt = `You are a Lead Engineering Manager & Release Architect.
Synthesize a sequential delivery roadmap of implementation milestones for the project.

Return ONLY a valid JSON object matching this EXACT schema with no markdown code fences:
{
  "overview": "Clear 2-3 sentence overview of delivery phase sequencing",
  "items": [
    {
      "title": "Clear milestone title",
      "phase": "MVP" | "PHASE_2" | "PHASE_3",
      "status": "todo" | "in_progress" | "completed",
      "dependsOn": ["Prerequisite Task Title"],
      "estimatedDays": 2
    }
  ]
}`;

  const featureTitles = features.map((f) => f.title).join("; ");
  const adrTitles = decisions.map((d) => d.decision).join("; ");

  const userPrompt = `Project Name: ${projectName}
Vision Idea: ${ideaText}
Key Features: ${featureTitles || "N/A"}
Key Architecture Decisions: ${adrTitles || "N/A"}`;

  try {
    const rawText = await invokeLlmWithFallback(
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      { operation: "roadmap" }
    );

    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);

    return roadmapSynthesisSchema.parse(parsed);
  } catch (err: any) {
    console.error("Roadmap Node Synthesis Error:", err);
    throw new Error(`Roadmap Synthesis Failed: ${err?.message || err}`);
  }
}
