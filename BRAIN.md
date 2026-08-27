# BRAIN.md — ForgeFlow AI build memory

## Snapshot

ForgeFlow AI is a Next.js 16.2.9 app that turns a one-line software idea into a structured, reasoned, implementation-ready blueprint using LangGraph.js agent orchestration, Clerk auth, and Supabase/Postgres. **Current phase: Phase 2 complete.** AI Requirement Synthesis with LangGraph.js, Groq Llama-3.3 / Gemini provider fallback, Zod output guards, interactive AI Copilot Chat drawer, and live requirements view are fully operational.

## Where things actually live

- **Route structure**: `app/(marketing)/` = landing page; `app/(auth)/sign-{in,up}/` = Clerk auth pages; `app/(app)/` = authenticated workspace (dashboard, projects)
- **AI Core**: `lib/ai/provider.ts` (LLM abstraction), `lib/ai/graph.ts` (LangGraph.js state graph workflow), `lib/validations/ai.ts` (Zod output guards).
- **AI Actions & API**: `lib/actions/ai.ts` (`analyzeProjectAction`, `sendChatMessageAction`), `/api/projects/[id]/analyze`, `/api/projects/[id]/chat`.
- **AI UI Components**: `components/ai/AnalyzeProjectButton.tsx` (step status button), `components/ai/ProjectChatDrawer.tsx` (sliding architectural copilot chat).
- **Workspace Shell**: `app/(app)/projects/[id]/layout.tsx` (single-tenant guard), `page.tsx` (Overview), `[tab]/page.tsx` (Requirements, Features, Architecture, Roadmap).
- **Unit Tests**: `tests/unit/ownership.test.ts` (tenant isolation), `tests/unit/ai-parser.test.ts` (Zod output guard & markdown fence stripper).

## Decisions made & why

- **Zero-Unvalidated-LLM-Output Policy**: All raw LLM JSON outputs pass through `cleanJsonText` and `requirementSynthesisSchema.parse()`. Invalid JSON or failed schemas trigger a safe fallback to prevent database corruption.
- **Provider Fallback Strategy**: Primary model is Groq (`llama-3.3-70b-versatile`) for speed; secondary is Google Gemini (`gemini-1.5-flash`); dev offline mock generator triggers when no API keys are set.
- **Single-tenant 404 Ownership Guard**: Filter all project queries and AI Server Actions by `ownerId === auth().userId`. Unmatched resources return 404 (not 403).

## Known gotchas

- **LangChain package property names**: `ChatGroq` and `ChatGoogleGenerativeAI` accept `model` property in options (not `modelName`).
- **URL-encoding password in Postgres URLs**: Password contains `@` which must be encoded as `%40` in connection string URLs (`postgresql://postgres:Warish%40786@localhost:5432/forgeflow`).

## Current phase & next steps

**Phase 0: COMPLETE** ✓
**Phase 1: COMPLETE** ✓
**Phase 2: COMPLETE** ✓

**Phase 3 next steps** (Architecture & Technical Decisions):
1. Create Tech Stack & ADR Synthesis Agent Node in LangGraph graph.
2. Generate structured Architecture Decision Records (ADRs) comparing technology trade-offs.
3. Build System Architecture & Decision Log view (`/projects/[id]/architecture`).
4. Generate component dependency graph & database schema models.
