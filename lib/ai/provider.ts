import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { logAiUsageAction } from "@/lib/services/quota";

/**
 * Cleans markdown code blocks and extracts JSON payload from LLM text responses
 */
export function cleanJsonText(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText.trim();

  // Extract contents inside ```json ... ``` or ``` ... ``` if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Trim leading/trailing commentary around JSON object or array
  const firstObj = cleaned.indexOf("{");
  const firstArr = cleaned.indexOf("[");
  let startIdx = -1;
  if (firstObj !== -1 && firstArr !== -1) {
    startIdx = Math.min(firstObj, firstArr);
  } else if (firstObj !== -1) {
    startIdx = firstObj;
  } else if (firstArr !== -1) {
    startIdx = firstArr;
  }

  if (startIdx !== -1) {
    const lastObj = cleaned.lastIndexOf("}");
    const lastArr = cleaned.lastIndexOf("]");
    const endIdx = Math.max(lastObj, lastArr);
    if (endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
  }

  return cleaned.trim();
}

/**
 * Cleans markdown wrap (```markdown ... ```) without trimming inner text or markdown headers
 */
export function cleanMarkdownText(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```markdown")) {
    cleaned = cleaned.replace(/^```markdown\n?/i, "").replace(/\n?```$/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  }
  return cleaned.trim();
}

/**
 * Safe structured server logging for AI stages (no secret credentials)
 */
export function logAiStage(stage: string, meta: Record<string, unknown>): void {
  const metaStr = Object.entries(meta)
    .filter(([key, v]) => Boolean(key) && v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" ");
  console.log(`[AI] stage=${stage} ${metaStr}`);
}

/**
 * Returns configured Groq model ID (default: "openai/gpt-oss-120b")
 */
export function getGroqModel(): string {
  return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
}

/**
 * Returns configured Gemini model ID (default: "gemini-2.5-flash")
 */
export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

/**
 * Returns primary configured LLM provider ("groq" | "gemini")
 */
export function getLlmProvider(): "groq" | "gemini" {
  const provider = (process.env.LLM_PROVIDER || "groq").toLowerCase().trim();
  return provider === "gemini" ? "gemini" : "groq";
}

export interface ClassifiedLlmError {
  category: "auth_error" | "model_not_found" | "rate_limit" | "server_error" | "timeout" | "unknown";
  message: string;
  status?: number;
}

export function classifyLlmError(err: unknown): ClassifiedLlmError {
  const errObj = err as { message?: string; status?: number; statusCode?: number; response?: { status?: number } } | null;
  const str = (errObj?.message || String(err)).toLowerCase();
  const status = errObj?.status || errObj?.statusCode || errObj?.response?.status;

  if (status === 404 || str.includes("404") || str.includes("model_not_found") || str.includes("does not exist") || str.includes("not found")) {
    return { category: "model_not_found", message: errObj?.message || "Model not found or unavailable", status: 404 };
  }
  if (status === 401 || status === 403 || str.includes("401") || str.includes("403") || str.includes("unauthorized") || str.includes("invalid api key") || str.includes("permission_denied")) {
    return { category: "auth_error", message: errObj?.message || "Authentication or permission failure", status: status || 401 };
  }
  if (status === 429 || str.includes("429") || str.includes("rate_limit") || str.includes("quota_exceeded") || str.includes("too many requests")) {
    return { category: "rate_limit", message: errObj?.message || "Rate limit or quota exceeded", status: 429 };
  }
  if (str.includes("timeout") || str.includes("etimedout") || str.includes("econnaborted")) {
    return { category: "timeout", message: errObj?.message || "Provider request timed out" };
  }
  if ((status && status >= 500) || str.includes("500") || str.includes("502") || str.includes("503") || str.includes("504") || str.includes("server_error")) {
    return { category: "server_error", message: errObj?.message || "Provider internal server error", status: status || 500 };
  }

  return { category: "unknown", message: errObj?.message || String(err), status };
}

/**
 * Note: This in-memory RateLimiter guards local request bursts per instance.
 * It is NOT a globally synchronized limiter across multiple Vercel serverless instances.
 */
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

export async function invokeGroq(messages: BaseMessage[]): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }
  const modelName = getGroqModel();
  const groqClient = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: modelName,
    temperature: 0.2,
  });
  const response = await groqClient.invoke(messages);
  return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
}

export async function invokeGemini(messages: BaseMessage[]): Promise<string> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not configured.");
  }
  const modelName = getGeminiModel();
  const geminiClient = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    model: modelName,
    temperature: 0.2,
  });
  const response = await geminiClient.invoke(messages);
  return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
}

/**
  * Returns the configured LangChain Chat Model based on LLM_PROVIDER env variable
  */
export function getLlmClient(forceProvider?: "groq" | "gemini"): BaseChatModel | null {
  const provider = forceProvider || getLlmProvider();

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: getGroqModel(),
      temperature: 0.2,
    });
  }

  if (
    (provider === "gemini" || !process.env.GROQ_API_KEY) &&
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: getGeminiModel(),
      temperature: 0.2,
    });
  }

  return null;
}

/**
 * Invokes LLM with bi-directional failover between Groq and Gemini.
 * Throws a detailed combined diagnostic error if both providers fail (NO silent canned response fallback).
 */
export async function invokeLlmWithFallback(
  messages: BaseMessage[],
  context?: { userId?: string; projectId?: string; operation?: string }
): Promise<string> {
  const preferred = getLlmProvider();
  const primaryName = preferred === "groq" ? `Groq (${getGroqModel()})` : `Gemini (${getGeminiModel()})`;
  const secondaryName = preferred === "groq" ? `Gemini (${getGeminiModel()})` : `Groq (${getGroqModel()})`;

  let primaryError: ClassifiedLlmError | null = null;
  let secondaryError: ClassifiedLlmError | null = null;

  // ── Step 1: Attempt Primary Provider ──────────────────────────────────────
  if (preferred === "groq") {
    if (process.env.GROQ_API_KEY && groqLimiter.canProceed()) {
      try {
        return await invokeGroq(messages);
      } catch (err: any) {
        primaryError = classifyLlmError(err);
        console.warn(`[AI Provider] Primary provider ${primaryName} failed [${primaryError.category}]: ${primaryError.message}. Initiating failover to ${secondaryName}...`);
      }
    } else if (!process.env.GROQ_API_KEY) {
      primaryError = { category: "auth_error", message: "GROQ_API_KEY is missing from environment" };
    } else {
      primaryError = { category: "rate_limit", message: "Groq local rate limit queue is full (28 RPM)" };
    }
  } else {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        return await invokeGemini(messages);
      } catch (err: any) {
        primaryError = classifyLlmError(err);
        console.warn(`[AI Provider] Primary provider ${primaryName} failed [${primaryError.category}]: ${primaryError.message}. Initiating failover to ${secondaryName}...`);
      }
    } else {
      primaryError = { category: "auth_error", message: "GOOGLE_GENERATIVE_AI_API_KEY is missing from environment" };
    }
  }

  // ── Step 2: Attempt Secondary / Fallback Provider ───────────────────────────
  if (preferred === "groq") {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const text = await invokeGemini(messages);

        if (context?.userId) {
          logAiUsageAction({
            userId: context.userId,
            projectId: context.projectId,
            operation: (context.operation || "fallback") as any,
            provider: "gemini",
            model: getGeminiModel(),
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            status: "success",
          }).catch((e) => console.error("Failed logging fallback usage:", e));
        }

        return text;
      } catch (geminiErr: any) {
        secondaryError = classifyLlmError(geminiErr);
        console.error(`[AI Provider] Fallback provider ${secondaryName} also failed [${secondaryError.category}]: ${secondaryError.message}`);
      }
    } else {
      secondaryError = { category: "auth_error", message: "GOOGLE_GENERATIVE_AI_API_KEY is missing from environment" };
    }
  } else {
    if (process.env.GROQ_API_KEY && groqLimiter.canProceed()) {
      try {
        const text = await invokeGroq(messages);

        if (context?.userId) {
          logAiUsageAction({
            userId: context.userId,
            projectId: context.projectId,
            operation: (context.operation || "fallback") as any,
            provider: "groq",
            model: getGroqModel(),
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            status: "success",
          }).catch((e) => console.error("Failed logging fallback usage:", e));
        }

        return text;
      } catch (groqErr: any) {
        secondaryError = classifyLlmError(groqErr);
        console.error(`[AI Provider] Fallback provider ${secondaryName} also failed [${secondaryError.category}]: ${secondaryError.message}`);
      }
    } else if (!process.env.GROQ_API_KEY) {
      secondaryError = { category: "auth_error", message: "GROQ_API_KEY is missing from environment" };
    } else {
      secondaryError = { category: "rate_limit", message: "Groq local rate limit queue is full" };
    }
  }

  // ── Step 3: Combine Diagnostics & Fail Safe ────────────────────────────────
  const pDesc = primaryError ? `${primaryName} (${primaryError.category})` : primaryName;
  const sDesc = secondaryError ? `${secondaryName} (${secondaryError.category})` : secondaryName;

  throw new Error(`Primary provider ${pDesc} unavailable; fallback provider ${sDesc} also failed.`);
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

export interface ProviderHealthReport {
  groq: { status: "ok" | "error" | "missing_key"; model: string; message?: string };
  gemini: { status: "ok" | "error" | "missing_key"; model: string; message?: string };
  primary: "groq" | "gemini";
}

/**
 * Independent runtime health check for Groq and Gemini providers
 */
export async function checkLlmProviderHealth(): Promise<ProviderHealthReport> {
  const groqModel = getGroqModel();
  const geminiModel = getGeminiModel();
  const primary = getLlmProvider();

  let groqResult: { status: "ok" | "error" | "missing_key"; model: string; message?: string } = {
    status: process.env.GROQ_API_KEY ? "error" : "missing_key",
    model: groqModel,
  };

  let geminiResult: { status: "ok" | "error" | "missing_key"; model: string; message?: string } = {
    status: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "error" : "missing_key",
    model: geminiModel,
  };

  if (process.env.GROQ_API_KEY) {
    try {
      const res = await invokeGroq([new HumanMessage("Test health check response")]);
      if (res) groqResult = { status: "ok", model: groqModel };
    } catch (err: unknown) {
      const classified = classifyLlmError(err);
      groqResult = { status: "error", model: groqModel, message: `[${classified.category}] ${classified.message}` };
    }
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const res = await invokeGemini([new HumanMessage("Test health check response")]);
      if (res) geminiResult = { status: "ok", model: geminiModel };
    } catch (err: unknown) {
      const classified = classifyLlmError(err);
      geminiResult = { status: "error", model: geminiModel, message: `[${classified.category}] ${classified.message}` };
    }
  }

  return { groq: groqResult, gemini: geminiResult, primary };
}


