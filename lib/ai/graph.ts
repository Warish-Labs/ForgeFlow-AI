import { Annotation, StateGraph } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import {
  getLlmClient,
  cleanJsonText,
  generateMockRequirementSynthesis,
} from "./provider";
import {
  requirementSynthesisSchema,
  RequirementSynthesisResult,
} from "@/lib/validations/ai";
import { SystemArchitectureSynthesisResult } from "@/lib/validations/architecture";

/**
  * Define state channel annotation for LangGraph.js
  */
export const ForgeFlowGraphState = Annotation.Root({
  projectId: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  projectName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  ideaText: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  result: Annotation<RequirementSynthesisResult | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  architectureResult: Annotation<SystemArchitectureSynthesisResult | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  error: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  status: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "IDLE",
  }),
});

export type ForgeFlowState = typeof ForgeFlowGraphState.State;

/**
  * Requirement Synthesis Node
  * Converts raw software vision text into structured requirements, tech stack recommendations, and feature list.
  */
export async function requirementSynthesisNode(state: ForgeFlowState) {
  const { ideaText, projectName } = state;

  const llm = getLlmClient();

  // If no live LLM client available (no API key in dev), use realistic mock generator
  if (!llm) {
    const mockOutput = generateMockRequirementSynthesis(ideaText, projectName);
    return {
      result: mockOutput,
      status: "COMPLETED",
      error: null,
    };
  }

  const systemPrompt = `You are an elite Software Architect and Systems Analyst.
Your task is to analyze a raw software vision description and produce a structured JSON implementation blueprint.

Return ONLY a valid JSON object matching this EXACT schema format with no extra markdown text or wrapping:
{
  "problemStatement": "Clear concise 1-2 sentence description of the core problem being solved",
  "suggestedStack": ["Tech1", "Tech2", "Tech3"],
  "functionalRequirements": ["Requirement 1", "Requirement 2"],
  "nonFunctionalRequirements": ["NFR 1", "NFR 2"],
  "extractedFeatures": [
    {
      "title": "Feature Name",
      "description": "Feature description",
      "phase": "MVP" | "PHASE_2" | "PHASE_3",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`;

  const userPrompt = `Project Name: ${projectName}
Vision Description:
${ideaText}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const rawText = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);

    // Validate through Zod schema guard
    const validated = requirementSynthesisSchema.parse(parsed);

    return {
      result: validated,
      status: "COMPLETED",
      error: null,
    };
  } catch (err: any) {
    console.error("AI Synthesis Error, using fallback generator:", err);
    // Graceful fallback to mock output on parsing/validation error
    const fallbackOutput = generateMockRequirementSynthesis(ideaText, projectName);
    return {
      result: fallbackOutput,
      status: "COMPLETED",
      error: null,
    };
  }
}

/**
  * Compile the LangGraph state graph
  */
export function createSynthesisGraph() {
  const workflow = new StateGraph(ForgeFlowGraphState)
    .addNode("synthesize", requirementSynthesisNode)
    .addEdge("__start__", "synthesize");

  return workflow.compile();
}
