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

/**
  * Mock generator for offline / local architecture synthesis
  */
export function generateMockArchitectureSynthesis(projectName: string, techStack: string[]) {
  const stack = techStack.length > 0 ? techStack.join(", ") : "Next.js 16, PostgreSQL, Prisma, Tailwind CSS";

  return {
    overview: `${projectName} is structured as a decoupled, high-performance web application using modern App Router architecture, server side rendering, and stateful database persistence.`,
    components: [
      {
        name: "Web Application Client & API Router",
        type: "frontend" as const,
        description: "Renders modern dark-mode React interface and handles server action RPC mutations.",
        tech: "Next.js 16 (App Router) + React 19",
      },
      {
        name: "Database Persistence Layer",
        type: "database" as const,
        description: "Stores project blueprints, features, decisions, and chat session history with strict single-tenant user isolation.",
        tech: "PostgreSQL 16 + Prisma ORM",
      },
      {
        name: "AI Agent Orchestration Engine",
        type: "backend" as const,
        description: "Executes multi-step requirement synthesis and architecture design state graphs.",
        tech: "LangGraph.js + Groq / Gemini LLMs",
      },
    ],
    dataModels: [
      {
        entity: "Project Blueprint",
        description: "Core entity storing idea vision text, problem statement, requirements, and target tech stack.",
        fields: ["id (UUID)", "ownerId (Clerk String)", "name", "ideaText", "techStack (JSON)", "status (Enum)"],
      },
      {
        entity: "Architecture Decision (ADR)",
        description: "Immutable decision records capturing trade-offs, reasoning, and rejected alternatives.",
        fields: ["id (UUID)", "projectId (FK)", "decision", "reasoning", "alternative", "affectedAreas (String[])"],
      },
    ],
    decisions: [
      {
        decision: `PostgreSQL with Prisma ORM for relational persistence (${stack})`,
        reasoning: "Strong schema validation and transaction safety prevent corrupt state across complex project relationships.",
        alternative: "MongoDB with Mongoose (Rejected due to weak cross-table transaction guarantees).",
        affectedAreas: ["Database Layer", "Server Actions"],
      },
      {
        decision: "Single-tenant ownerId query filter guards on all resources",
        reasoning: "Guarantees full data privacy across multi-user environments without complex RBAC middleware.",
        alternative: "Shared global multi-tenant schema with loose API checks (Rejected due to data leak risk).",
        affectedAreas: ["API Layer", "Security Architecture"],
      },
      {
        decision: "Zero-unvalidated-LLM-output DB protection via Zod schemas",
        reasoning: "Ensures AI LLM response hallucinated fields never corrupt the PostgreSQL database schema.",
        alternative: "Direct JSON DB insertion of raw LLM output (Rejected due to high mutation error risk).",
        affectedAreas: ["AI Agent Engine", "Data Persistence"],
      },
    ],
  };
}

