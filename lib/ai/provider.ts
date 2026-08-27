import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
  * Cleans markdown code blocks (e.g. ```json ... ```) from LLM text responses
  */
export function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  }
  return cleaned.trim();
}

/**
  * Returns the configured LangChain Chat Model based on LLM_PROVIDER env variable
  */
export function getLlmClient(): BaseChatModel | null {
  const provider = process.env.LLM_PROVIDER || "groq";

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
    });
  }

  if (
    (provider === "gemini" || !process.env.GROQ_API_KEY) &&
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: "gemini-1.5-flash",
      temperature: 0.2,
    });
  }

  return null;
}

/**
  * Mock generator for offline / local testing when no live LLM keys are supplied
  */
export function generateMockRequirementSynthesis(ideaText: string, projectName: string) {
  return {
    problemStatement: `Current solutions for ${projectName} lack automated, real-time architecture orchestration and state-aware project tracking, resulting in fragmented specs and manual engineering overhead.`,
    suggestedStack: ["Next.js 16 (App Router)", "TypeScript", "PostgreSQL", "Prisma ORM", "Tailwind CSS v4", "LangGraph.js"],
    functionalRequirements: [
      `Allow users to input raw software vision prompts for ${projectName} and convert them into structured blueprints.`,
      "Enforce single-tenant user authorization isolation across all API endpoints and server actions.",
      "Provide an interactive dashboard with real-time project state badges and feature counters.",
      "Expose an AI Chat interface for context-aware architectural Q&A.",
    ],
    nonFunctionalRequirements: [
      "Sub-200ms API response latency for dashboard resource queries.",
      "Strict zero-unvalidated-LLM-output DB write policy enforced by Zod schema guards.",
      "Responsive, dark-mode visual interface matching high-end modern developer tools.",
    ],
    extractedFeatures: [
      {
        title: "AI Blueprint Requirement Synthesizer",
        description: `Extract functional requirements, tech stack, and user stories automatically from ${projectName} vision text.`,
        phase: "MVP" as const,
        priority: "HIGH" as const,
      },
      {
        title: "Single-Tenant Tenant Isolation Guard",
        description: "Verify project ownership per request, returning 404 Not Found for non-owners.",
        phase: "MVP" as const,
        priority: "HIGH" as const,
      },
      {
        title: "Context-Aware Architecture Assistant Chat",
        description: "Interactive workspace drawer allowing users to query project design rationale.",
        phase: "PHASE_2" as const,
        priority: "MEDIUM" as const,
      },
      {
        title: "Automated ADR Generator",
        description: "Generate structured Architecture Decision Records comparing technology trade-offs.",
        phase: "PHASE_3" as const,
        priority: "LOW" as const,
      },
    ],
  };
}
