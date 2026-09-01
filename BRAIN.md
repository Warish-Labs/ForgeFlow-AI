# BRAIN.md — ForgeFlow AI build memory

## Snapshot

ForgeFlow AI is a Next.js 16.2.9 app that turns a one-line software idea into a structured, reasoned, implementation-ready blueprint using LangGraph.js agent orchestration, Clerk auth, and Supabase/Postgres. **Current status: All Core Phases (0 - 4) Complete.** Implementation Roadmap & Milestone synthesis, dependency ordering, exportable Markdown Technical Blueprint compiler (`.md`), and single-tenant security isolation are fully operational.

## Where things actually live

- **Route structure**: `app/(marketing)/` = landing page; `app/(auth)/sign-{in,up}/` = Clerk auth pages; `app/(app)/` = authenticated workspace (dashboard, projects)
- **AI Core**: `lib/ai/provider.ts` (Groq/Gemini LLM abstraction), `lib/ai/graph.ts` (LangGraph.js state graph), `lib/validations/` (`ai.ts`, `architecture.ts`, `roadmap.ts`).
- **AI Nodes**: `lib/ai/nodes/` (`architectureNode.ts`, `roadmapNode.ts`).
- **Actions & API**: `lib/actions/` (`project.ts`, `ai.ts`, `architecture.ts`, `roadmap.ts`), `/api/projects/[id]/` (`analyze`, `architecture`, `roadmap`, `chat`, `export`).
- **UI Components**: `components/ui/` (design primitives), `components/projects/` (ProjectCard, CreateModal), `components/ai/` (AnalyzeButton, ChatDrawer), `components/architecture/` (DecisionCard), `components/roadmap/` (RoadmapTimeline, ExportBlueprintButton).
- **Unit Tests**: `tests/unit/` (`ownership.test.ts`, `ai-parser.test.ts`, `architecture-parser.test.ts`, `roadmap-parser.test.ts`).

## Decisions made & why

- **Exportable Markdown Blueprint**: `exportBlueprintMarkdownAction` compiles complete software specification including Vision, Problem Statement, Requirements, Features, ADRs, and Delivery Roadmap into a clean `.md` document for developer download.
- **Dependency Ordering in Roadmap**: Milestone tasks encode `dependsOn` arrays ensuring schema setup and auth precede feature releases.
- **Zero-Unvalidated-LLM-Output Guard**: Zod validation schemas wrap all AI synthesis nodes.

## Known gotchas

- **Prisma env vars**: Running `npx prisma generate` requires dummy or real `DATABASE_URL` and `DIRECT_URL` in env if running in isolated bash environment.

## Current phase status

**Phase 0: COMPLETE** ✓ (Project Scaffolding & Brand System)
**Phase 1: COMPLETE** ✓ (Project CRUD, Workspace Shell & Ownership Guard)
**Phase 2: COMPLETE** ✓ (AI Core, Requirement Synthesis & Copilot Chat)
**Phase 3: COMPLETE** ✓ (System Architecture & ADR Synthesis)
**Phase 4: COMPLETE** ✓ (Implementation Roadmap & Markdown Blueprint Export)
**Phase 5 (AI Grounding Overhaul): COMPLETE** ✓ (Zero Canned Replies, Groq/Gemini Failover, Dynamic Q&A & LLM Document Synthesis)

## 2026-09-01 — Final Production Repair & Usage Period Fix

- **Analyze Vision Pipeline Execution & Persistence**:
  - Fixed disconnect between LangGraph `graph.invoke()` output and `analyzeProjectAction` persistence.
  - Enforced strict discriminated result contract (`COMPLETE` / `NEEDS_INPUT` / `FAILURE`).
  - Added atomic Prisma transaction persisting `Project.problemStatement`, `Project.techStack`, `Project.requirements` (`functional` & `nonFunctional`), `Project.assumptions`, `Project.openQuestions`, `Project.status: "ARCHITECTURE"`, `Feature` records, stack `Decision` ADR, and `AuditLog`.
  - Added safe structured stage logging (`ANALYZE_START` -> `ANALYZE_COMPLETE`).
  - Updated UI buttons (`AnalyzeProjectButton.tsx`) to show compact result summary (`✓ Requirements: X, ✓ Features: Y, ✓ Assumptions: Z`) and refresh UI components.
  - Handled question resume flow (`NEEDS_INPUT` modal -> `resumeProjectSynthesisAction` -> `COMPLETE`).

- **Canonical Usage Period Calculator (`lib/services/usagePeriod.ts`)**:
  - Implemented strict UTC date boundary helpers (`getStartOfTodayUTC`, `getEndOfTodayUTC`, `getStartOfMonthUTC`, `getStartOfNextMonthUTC`).
  - Fixed Admin dashboard bug where lifetime user token usage was checked against daily quota. Admin and User dashboards now query the exact same usage calculation functions (`tokensToday`, `tokensThisMonth`) using immutable `AiUsageLog` database records.
  - Changing the day boundary resets `tokensToday` while preserving `tokensThisMonth` continuously until 1st of next month.

- **Bottom Project Sections (Assumptions, Questions, Features)**:
  - **Confirmed Assumptions**: Enabled full inline CRUD (Add, Edit, Delete, Save immediately to DB, display AI-generated assumptions).
  - **Open Technical Questions**: Dynamic question list rendering with text input / option selection, saving to DB.
  - **Planned Features & Blueprint Completeness**: Connected Planned Features card to live `Feature` records and updated Blueprint Progress score truthfully.
