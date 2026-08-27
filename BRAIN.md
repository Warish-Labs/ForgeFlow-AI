# BRAIN.md — ForgeFlow AI build memory

## Snapshot

ForgeFlow AI is a Next.js 16.2.9 app that turns a one-line software idea into a structured, reasoned, implementation-ready blueprint using LangGraph.js agent orchestration, Clerk auth, and Supabase/Postgres. **Current phase: Phase 3 complete.** Architecture Decision Record (ADR) synthesis, system topology modeling, Zod validation guards, live ADR DecisionCards UI, and state transition to `ROADMAP_READY` are fully operational.

## Where things actually live

- **Route structure**: `app/(marketing)/` = landing page; `app/(auth)/sign-{in,up}/` = Clerk auth pages; `app/(app)/` = authenticated workspace (dashboard, projects)
- **AI Architecture Core**: `lib/validations/architecture.ts` (Zod ADR schemas), `lib/ai/nodes/architectureNode.ts` (LangGraph architecture synthesis node), `lib/ai/graph.ts` (state graph).
- **Architecture Actions & API**: `lib/actions/architecture.ts` (`generateArchitectureAction`), `/api/projects/[id]/architecture`.
- **Architecture UI Components**: `components/architecture/DecisionCard.tsx` (ADR trade-offs card), `components/architecture/GenerateArchitectureButton.tsx` (step status button).
- **Workspace Shell**: `app/(app)/projects/[id]/layout.tsx` (single-tenant guard), `page.tsx` (Overview), `[tab]/page.tsx` (Requirements, Features, Architecture, Roadmap).
- **Unit Tests**: `tests/unit/ownership.test.ts`, `tests/unit/ai-parser.test.ts`, `tests/unit/architecture-parser.test.ts`.

## Decisions made & why

- **ADR Structure**: Every architectural decision contains decision title, technical trade-off reasoning, rejected alternatives considered, and affected system component tags.
- **Zero-Unvalidated-LLM-Output Policy**: All architecture JSON outputs are validated through `systemArchitectureSynthesisSchema.parse()` before updating Prisma `Decision` records or `Project.architecture` JSON.
- **Single-tenant 404 Guard**: Filter all architecture queries and Server Actions by `ownerId === auth().userId`.

## Known gotchas

- **Prisma env vars**: Running `npx prisma generate` requires dummy or real `DATABASE_URL` and `DIRECT_URL` in env if running in isolated bash environment.

## Current phase & next steps

**Phase 0: COMPLETE** ✓
**Phase 1: COMPLETE** ✓
**Phase 2: COMPLETE** ✓
**Phase 3: COMPLETE** ✓

**Phase 4 next steps** (Roadmap & Milestone Generator):
1. Create Roadmap Generator Node in LangGraph.
2. Build sequential milestone items mapped by dependency order (`dependsOn`).
3. Build interactive Roadmap Gantt / Milestone timeline view (`/projects/[id]/roadmap`).
4. Generate exportable Markdown blueprint documentation.
