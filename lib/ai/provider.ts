import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage } from "@langchain/core/messages";
import { logAiUsageAction } from "@/lib/services/quota";

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

class RateLimiter {
  private timestamps: number[] = [];
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((ts) => now - ts < this.windowMs);
    if (this.timestamps.length < this.limit) {
      this.timestamps.push(now);
      return true;
    }
    return false;
  }
}

// 28 RPM limit for Groq (30 RPM quota buffer)
const groqLimiter = new RateLimiter(28, 60000);

/**
  * Returns the configured LangChain Chat Model based on LLM_PROVIDER env variable
  */
export function getLlmClient(forceProvider?: "groq" | "gemini"): BaseChatModel | null {
  const provider = forceProvider || process.env.LLM_PROVIDER || "groq";

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.2,
    });
  }

  if (
    (provider === "gemini" || !process.env.GROQ_API_KEY) &&
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      temperature: 0.2,
    });
  }

  return null;
}

/**
 * Invokes LLM with automatic rate-limiting and failover from Groq to Gemini.
 * Throws an error if both providers fail (NO silent canned response fallback).
 */
export async function invokeLlmWithFallback(
  messages: BaseMessage[],
  context?: { userId?: string; projectId?: string; operation?: string }
): Promise<string> {
  const providerPreference = process.env.LLM_PROVIDER || "groq";

  // Try Groq first if preferred and within rate limits
  if (providerPreference === "groq" && process.env.GROQ_API_KEY && groqLimiter.canProceed()) {
    try {
      const groqClient = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0.2,
      });
      const response = await groqClient.invoke(messages);
      return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    } catch (err: any) {
      console.warn("Groq LLM invocation failed or rate-limited, attempting Gemini fallback:", err?.message || err);
    }
  }

  // Gemini Fallback / Primary
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const geminiClient = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        temperature: 0.2,
      });
      const response = await geminiClient.invoke(messages);
      const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

      if (context?.userId) {
        logAiUsageAction({
          userId: context.userId,
          projectId: context.projectId,
          operation: (context.operation || "fallback") as any,
          provider: "gemini",
          model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          status: "success",
        }).catch((e) => console.error("Failed logging fallback usage:", e));
      }

      return text;
    } catch (geminiErr: any) {
      console.error("Gemini LLM invocation failed:", geminiErr);
    }
  }

  // Direct Groq retry if Gemini was not configured or failed and Groq wasn't tried yet
  if (process.env.GROQ_API_KEY) {
    try {
      const groqClient = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0.2,
      });
      const response = await groqClient.invoke(messages);
      return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    } catch (err: any) {
      throw new Error(`Groq LLM call failed: ${err?.message || err}`);
    }
  }

  throw new Error("No operational LLM providers available (GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY required).");
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

/**
  * Mock generator for offline / local roadmap synthesis
  */
export function generateMockRoadmapSynthesis(projectName: string) {
  return {
    overview: `${projectName} sequential implementation roadmap organized into MVP release core, Phase 2 AI orchestration enhancements, and Phase 3 scaling milestones.`,
    items: [
      {
        title: "Database Schema & Prisma ORM Migration",
        phase: "MVP" as const,
        status: "completed",
        dependsOn: [],
        estimatedDays: 1,
      },
      {
        title: "Single-Tenant Clerk Auth & Ownership Guards",
        phase: "MVP" as const,
        status: "completed",
        dependsOn: ["Database Schema & Prisma ORM Migration"],
        estimatedDays: 2,
      },
      {
        title: "Requirement Synthesis Agent Node & Zod Protection",
        phase: "MVP" as const,
        status: "completed",
        dependsOn: ["Single-Tenant Clerk Auth & Ownership Guards"],
        estimatedDays: 2,
      },
      {
        title: "System Architecture ADR & Component Topology Generator",
        phase: "PHASE_2" as const,
        status: "in_progress",
        dependsOn: ["Requirement Synthesis Agent Node & Zod Protection"],
        estimatedDays: 3,
      },
      {
        title: "Interactive Architecture Copilot Drawer & Live Chat",
        phase: "PHASE_2" as const,
        status: "todo",
        dependsOn: ["System Architecture ADR & Component Topology Generator"],
        estimatedDays: 2,
      },
      {
        title: "Exportable Markdown Blueprint Compiler & Production Deployment",
        phase: "PHASE_3" as const,
        status: "todo",
        dependsOn: ["Interactive Architecture Copilot Drawer & Live Chat"],
        estimatedDays: 3,
      },
    ],
  };
}


