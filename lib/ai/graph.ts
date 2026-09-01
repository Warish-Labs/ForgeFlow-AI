import { Annotation, StateGraph, interrupt, MemorySaver } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import {
  cleanJsonText,
  generateMockRequirementSynthesis,
  invokeLlmWithFallback,
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
  const { ideaText, projectName, userAnswers = {}, projectId } = state;
  const hasKeys = Boolean(process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const answersCount = Object.keys(userAnswers).length;

  // Offline / Mock Mode Logic ONLY when no API keys exist
  if (!hasKeys) {
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
        status: "COMPLETE",
        error: null,
      };
    }

    const mockOutput = generateMockRequirementSynthesis(ideaText, projectName);
    if (userAnswers.db_choice) {
      mockOutput.suggestedStack = Array.from(new Set([...mockOutput.suggestedStack, userAnswers.db_choice]));
    }
    return {
      result: mockOutput,
      status: "COMPLETE",
      error: null,
    };
  }

  // Live LLM Mode
  const systemPrompt = `You are an elite Software Architect and Systems Analyst executing an interactive requirement synthesis pipeline for software blueprints.

You are NOT restricted to what the user provided — the user's input is a starting point, not a ceiling.
Analyze the given software vision and any user answers provided so far.

CRITICAL STACK GROUNDING RULES:
1. If the vision description or project input already specifies explicit technology choices (e.g. Next.js, TypeScript, PostgreSQL, Prisma, pgvector, Redis, BullMQ, Docker, Tailwind CSS, OpenAI API, LangGraph), HONOR those choices.
2. Do NOT ask redundant clarification questions about choices already explicitly specified or implied by the user's target stack.
3. If there are genuine, unstated technical ambiguities that have NOT yet been answered, return a JSON object with status "NEEDS_INPUT":
{
  "status": "NEEDS_INPUT",
  "questions": [
    {
      "id": "ambiguity_id",
      "type": "single_select",
      "prompt": "Clear question addressing the exact technical ambiguity in THIS project",
      "options": ["Option 1", "Option 2"],
      "reasoning": "Technical rationale explaining why this decision matters"
    }
  ]
}

4. If the user's input is ALREADY sufficient, OR if user answers have resolved ambiguities, return the finalized blueprint JSON with status "COMPLETE":
{
  "status": "COMPLETE",
  "problemStatement": "Clear concise 1-2 sentence problem description tailored to this vision",
  "suggestedTechStack": ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
  "functionalRequirements": ["Functional requirement 1", "Functional requirement 2"],
  "nonFunctionalRequirements": ["Non-functional requirement 1", "Non-functional requirement 2"],
  "extractedFeatures": [
    {
      "title": "Feature Name",
      "description": "Feature description",
      "phase": "MVP",
      "priority": "HIGH"
    }
  ],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "openQuestions": []
}`;

  const userPrompt = `Project Name: ${projectName}
Vision Description:
${ideaText}

User Answers Provided So Far:
${JSON.stringify(userAnswers)}`;

  try {
    const rawText = await invokeLlmWithFallback(
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      { projectId, operation: "analyze" }
    );

    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);

    if (
      (parsed.status === "NEEDS_INPUT" || parsed.status === "NEEDS_INPUT") &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length > 0 &&
      Object.keys(userAnswers).length === 0
    ) {
      return {
        result: null,
        pendingQuestions: parsed.questions,
        userAnswers,
        status: "NEEDS_INPUT",
        error: null,
      };
    }

    const validated = requirementSynthesisSchema.parse(parsed);
    // Combine stack array aliases
    const combinedStack = Array.from(
      new Set([...(validated.suggestedTechStack || []), ...(validated.suggestedStack || [])])
    );
    if (combinedStack.length === 0) {
      combinedStack.push("Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS");
    }
    validated.suggestedTechStack = combinedStack;
    validated.suggestedStack = combinedStack;

    return {
      result: validated,
      pendingQuestions: null,
      userAnswers,
      status: "COMPLETE",
      error: null,
    };
  } catch (err: unknown) {
    const errObj = err as { value?: { status?: string; questions?: QuestionItem[] }; message?: string };
    if (errObj?.value?.status === "NEEDS_INPUT" || (Array.isArray(err) && err[0]?.value?.status === "NEEDS_INPUT")) {
      const qPayload = errObj?.value?.questions || (err as Array<{ value?: { questions?: QuestionItem[] } }>)[0]?.value?.questions || [];
      return {
        result: null,
        pendingQuestions: qPayload,
        userAnswers,
        status: "NEEDS_INPUT",
        error: null,
      };
    }
    console.error("AI Synthesis Error in requirementSynthesisNode:", err);
    throw new Error(`Requirement Synthesis Failed: ${errObj?.message || String(err)}`);
  }
}

export const sharedCheckpointer = new MemorySaver();

export function createSynthesisGraph() {
  const workflow = new StateGraph(ForgeFlowGraphState)
    .addNode("synthesize", requirementSynthesisNode)
    .addEdge("__start__", "synthesize");

  return workflow.compile({ checkpointer: sharedCheckpointer });
}
