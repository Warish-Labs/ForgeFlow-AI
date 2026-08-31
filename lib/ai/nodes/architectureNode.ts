import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import {
  getLlmClient,
  cleanJsonText,
  generateMockArchitectureSynthesis,
  invokeLlmWithFallback,
} from "../provider";
import {
  systemArchitectureSynthesisSchema,
  SystemArchitectureSynthesisResult,
} from "@/lib/validations/architecture";

export interface ArchitectureNodeInput {
  projectName: string;
  ideaText: string;
  problemStatement?: string | null;
  techStack?: string[];
  requirements?: any;
}

export async function architectureSynthesisNode(
  input: ArchitectureNodeInput
): Promise<SystemArchitectureSynthesisResult> {
  const { projectName, ideaText, problemStatement, techStack = [] } = input;
  const hasKeys = Boolean(process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (!hasKeys) {
    return generateMockArchitectureSynthesis(projectName, techStack);
  }

  const systemPrompt = `You are a Principal Software Architect.
Synthesize a comprehensive System Architecture blueprint and Architecture Decision Records (ADRs) for the given software project.

Return ONLY a valid JSON object matching this EXACT schema with no markdown code fences:
{
  "overview": "Clear 2-3 sentence overview of overall system architecture",
  "components": [
    {
      "name": "Component Name",
      "type": "frontend" | "backend" | "database" | "queue" | "cache" | "external",
      "description": "Component responsibility",
      "tech": "Specific framework/tool"
    }
  ],
  "dataModels": [
    {
      "entity": "Entity Name",
      "description": "Entity purpose",
      "fields": ["field1", "field2"]
    }
  ],
  "decisions": [
    {
      "decision": "Architectural Choice Title",
      "reasoning": "Technical trade-off rationale explaining why this was selected",
      "alternative": "Rejected alternative technology or approach considered",
      "affectedAreas": ["System Component 1", "System Component 2"]
    }
  ]
}`;

  const userPrompt = `Project Name: ${projectName}
Vision Idea: ${ideaText}
Problem Statement: ${problemStatement || "N/A"}
Selected Stack: ${techStack.join(", ") || "Next.js, PostgreSQL, Tailwind"}`;

  try {
    const rawText = await invokeLlmWithFallback(
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      { operation: "architecture" }
    );

    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);

    return systemArchitectureSynthesisSchema.parse(parsed);
  } catch (err: any) {
    console.error("Architecture Node Synthesis Error:", err);
    throw new Error(`Architecture Synthesis Failed: ${err?.message || err}`);
  }
}
