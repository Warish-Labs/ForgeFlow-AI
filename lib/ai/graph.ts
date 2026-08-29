import { Annotation, StateGraph, interrupt, MemorySaver } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import {
  getLlmClient,
  cleanJsonText,
  generateMockRequirementSynthesis,
} from "./provider";
import {
  requirementSynthesisSchema,
  RequirementSynthesisResult,
  QuestionItem,
} from "@/lib/validations/ai";
import { SystemArchitectureSynthesisResult } from "@/lib/validations/architecture";
import { RoadmapSynthesisResult } from "@/lib/validations/roadmap";

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
  userAnswers: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...(x || {}), ...(y || {}) }),
    default: () => ({}),
  }),
  pendingQuestions: Annotation<QuestionItem[] | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  result: Annotation<RequirementSynthesisResult | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  architectureResult: Annotation<SystemArchitectureSynthesisResult | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  roadmapResult: Annotation<RoadmapSynthesisResult | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  error: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  status: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "IDLE", // "IDLE" | "NEEDS_INPUT" | "COMPLETED" | "ERROR"
  }),
});

export type ForgeFlowState = typeof ForgeFlowGraphState.State;

/**
 * Requirement Synthesis Node with Agentic Ask-User Tool Decision Reasoning
 */
export async function requirementSynthesisNode(state: ForgeFlowState) {
  const { ideaText, projectName, userAnswers = {} } = state;
  const llm = getLlmClient();

  const answersCount = Object.keys(userAnswers).length;

  // Offline / Mock Mode Logic when LLM API keys are not supplied
  if (!llm) {
    const lowerIdea = ideaText.toLowerCase();
    const hasPrisma = lowerIdea.includes("prisma");
    const hasDbChoice =
      lowerIdea.includes("postgres") ||
      lowerIdea.includes("mysql") ||
      lowerIdea.includes("sqlite") ||
      Boolean(userAnswers.db_choice);

    if (hasPrisma && !hasDbChoice && answersCount === 0) {
      const mockQuestions: QuestionItem[] = [
        {
          id: "db_choice",
          type: "single_select",
          prompt: "You specified Prisma as your ORM, but no database engine was selected. Which database should this project use?",
          options: ["PostgreSQL", "MySQL", "SQLite", "Let AI decide (PostgreSQL default)"],
          reasoning: "Prisma ORM requires a relational database driver configuration. PostgreSQL is recommended for production Next.js apps.",
        },
      ];

      // Invoke LangGraph interrupt pattern
      const resumedAnswers = interrupt({
        status: "NEEDS_INPUT",
        questions: mockQuestions,
      }) as Record<string, any> | undefined;

      const effectiveAnswers = resumedAnswers || userAnswers;
      const dbChoice = effectiveAnswers.db_choice || "PostgreSQL";
      const mockOutput = generateMockRequirementSynthesis(ideaText, projectName);
      mockOutput.suggestedStack = Array.from(new Set([...mockOutput.suggestedStack, dbChoice]));

      return {
        result: mockOutput,
        userAnswers: effectiveAnswers,
        status: "COMPLETED",
        error: null,
      };
    }

    const mockOutput = generateMockRequirementSynthesis(ideaText, projectName);
    if (userAnswers.db_choice) {
      mockOutput.suggestedStack = Array.from(new Set([...mockOutput.suggestedStack, userAnswers.db_choice]));
    }
    return {
      result: mockOutput,
      status: "COMPLETED",
      error: null,
    };
  }

  // Live LLM Mode
  const systemPrompt = `You are an elite Software Architect and Systems Analyst executing an interactive requirement synthesis pipeline.

You are NOT restricted to what the user provided — the user's input is a starting point, not a ceiling.
Think through the actual technical implications of the given stack & vision:
- If the user specifies an ORM like "Prisma" or "Drizzle" without a database engine, ask which database to use (e.g. PostgreSQL, MySQL, SQLite).
- If the user requests real-time features without specifying a WebSocket or PubSub layer, ask about real-time engine choice.
- If authentication or database is ambiguous, identify open decision points.

INSTRUCTIONS:
1. If there are genuine, critical technical decisions that are missing or ambiguous, and user Answers have NOT yet been provided to resolve them, return a JSON object asking questions:
{
  "status": "NEEDS_INPUT",
  "questions": [
    {
      "id": "db_choice",
      "type": "single_select",
      "prompt": "Clear question for the user",
      "options": ["Option 1", "Option 2"],
      "reasoning": "Clear technical rationale explaining WHY the AI agent is asking this question"
    }
  ]
}

2. If the user's input is ALREADY complete enough with clear stack details, OR if user answers have been provided, return the finalized blueprint JSON matching status "COMPLETED":
{
  "status": "COMPLETED",
  "problemStatement": "Clear concise 1-2 sentence problem description",
  "suggestedStack": ["Tech1", "Tech2", "Tech3"],
  "functionalRequirements": ["Requirement 1", "Requirement 2"],
  "nonFunctionalRequirements": ["NFR 1", "NFR 2"],
  "extractedFeatures": [
    {
      "title": "Feature Name",
      "description": "Feature description",
      "phase": "MVP",
      "priority": "HIGH"
    }
  ]
}`;

  const userPrompt = `Project Name: ${projectName}
Vision Description:
${ideaText}

User Answers Previously Provided:
${JSON.stringify(userAnswers)}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const rawText = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);

    if (
      parsed.status === "NEEDS_INPUT" &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length > 0 &&
      answersCount === 0
    ) {
      // Trigger LangGraph Interrupt
      const resumedAnswers = interrupt({
        status: "NEEDS_INPUT",
        questions: parsed.questions,
      }) as Record<string, any> | undefined;

      const finalAnswers = resumedAnswers || userAnswers;

      // Re-invoke LLM with user answers
      const secondResponse = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `Project Name: ${projectName}\nVision Description:\n${ideaText}\n\nUser Answers Provided:\n${JSON.stringify(finalAnswers)}`
        ),
      ]);

      const secondRaw = typeof secondResponse.content === "string" ? secondResponse.content : JSON.stringify(secondResponse.content);
      const secondCleaned = cleanJsonText(secondRaw);
      const secondParsed = JSON.parse(secondCleaned);

      const validated = requirementSynthesisSchema.parse(secondParsed);
      return {
        result: validated,
        userAnswers: finalAnswers,
        status: "COMPLETED",
        error: null,
      };
    }

    const validated = requirementSynthesisSchema.parse(parsed);
    return {
      result: validated,
      status: "COMPLETED",
      error: null,
    };
  } catch (err: any) {
    console.error("AI Synthesis Error, using fallback generator:", err);
    const fallbackOutput = generateMockRequirementSynthesis(ideaText, projectName);
    return {
      result: fallbackOutput,
      status: "COMPLETED",
      error: null,
    };
  }
}

export const sharedCheckpointer = new MemorySaver();

export function createSynthesisGraph() {
  const workflow = new StateGraph(ForgeFlowGraphState)
    .addNode("synthesize", requirementSynthesisNode)
    .addEdge("__start__", "synthesize");

  return workflow.compile({ checkpointer: sharedCheckpointer });
}
