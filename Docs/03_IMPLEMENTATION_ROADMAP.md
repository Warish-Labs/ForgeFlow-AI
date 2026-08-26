# ForgeFlow AI — Implementation Roadmap

Companion to `01_PRD.md` and `02_TDD.md`. Each phase produces a **working, demoable** system — never a half-built mess. Antigravity should not start Phase N+1 until Phase N's "Definition of Done" is genuinely met.

Git discipline applies across every phase (see `05_ANTIGRAVITY_MASTER_PROMPT.md` §6 for the exact commit conventions) — small, logical, conventional commits, never one giant "phase 1 done" commit.

---

## Phase 0 — Project Scaffolding
**Goal:** Repo exists, builds, deploys an empty shell.

- Init Next.js 15 + TypeScript (strict) + Tailwind + shadcn/ui.
- Set up folder structure exactly as in TDD §3.
- `.gitignore`, `.env.example` (keys only, no values), `README.md` skeleton.
- Prisma init, connect to Neon, empty schema, first migration.
- Auth.js wired with credentials provider only (GitHub OAuth can come later).
- Deploy empty shell to Vercel — confirm the full pipe (GitHub → Vercel → Neon) works before writing a single feature.

**Definition of Done:** A user can register, log in, log out, and see an empty dashboard, deployed and reachable at a live URL.

---

## Phase 1 — Project CRUD (no AI yet)
**Goal:** The persistent project model exists and is fully usable manually.

- `Project`, `Feature`, `Decision`, `RoadmapItem` Prisma models (TDD §4).
- Dashboard: list projects, empty state, "New Project" CTA.
- Create project (idea text + optional guided fields) — no AI call yet, just stores the raw idea.
- Project workspace shell with tab navigation (Overview / Requirements / Architecture / Roadmap / Decisions / Documents / Chat / Settings) — tabs can be placeholder pages.
- Delete/rename project, ownership-scoped queries everywhere.

**Definition of Done:** Full manual CRUD works, ownership is enforced (a second test user cannot see the first user's projects), skeleton loading states are in place — no AI involved yet.

---

## Phase 2 — Requirement Intelligence (first real AI feature)
**Goal:** Idea text → structured, validated requirements.

- LLM provider abstraction (`lib/ai/provider.ts`) with Groq as default, Gemini as fallback.
- `generateStructured` helper + Zod schemas for requirements.
- First LangGraph nodes: `analyzeIdea`, `clarify`, `generateRequirements`.
- `/api/projects/:id/analyze` route, rate-limited, logged to `AiUsageLog`.
- Requirements tab UI: structured requirement cards, editable, clarifying-question prompt when needed.
- Basic AI evaluation test set (`tests/eval/`) — at least 5 fixed idea inputs with assertions.

**Definition of Done:** A brand-new idea reliably produces valid structured requirements or a clear clarifying question — never a raw wall of unstructured text, never a silent failure.

---

## Phase 3 — Tech Stack + Architecture + Roadmap Generation
**Goal:** The "reasoning" layer that differentiates this from a generic AI chatbot.

- `generateTechStack` node — recommendation + reasoning + named alternative (TDD §6 graph).
- `generateArchitecture` node — text/ascii diagram tied to actual requirements (no unused pieces).
- `generateRoadmap` node — MVP/Phase 2/Phase 3 split, with explicit "scope too large for stated timeline" pushback logic.
- `validate` node — checks requirement coverage, contradiction detection, timeline realism.
- Decision log: every accepted recommendation writes a `Decision` record.
- Full LangGraph wiring per TDD §6 diagram.
- Architecture / Roadmap / Decisions tabs get real UI (not placeholders).

**Definition of Done:** One idea can go from raw text to a full blueprint (requirements → stack → architecture → roadmap → decision log) end-to-end, matching PRD success metric of under 5 minutes.

---

## Phase 4 — RAG Knowledge Base
**Goal:** Recommendations become evidence-grounded, not just model-memory-grounded.

- `knowledge-base/*.md` — write 10–20 curated notes (your own, on auth/DB/caching/rate-limiting/deployment trade-offs).
- `pgvector` extension enabled on Neon, `KnowledgeDocument`/`KnowledgeChunk` models added.
- `scripts/ingest-knowledge.ts` — chunk → embed (Gemini embeddings, transformers.js fallback) → store.
- `lib/rag/retriever.ts` — cosine similarity search, top-k.
- Wire retrieval into the tech-stack/architecture prompts as labeled `<retrieved_context>` — prompt-injection framing per TDD §7.
- `/api/knowledge/search` route for direct testing.

**Definition of Done:** Ask "should I use Redis here" and get an answer that visibly cites retrieved reasoning, not just a generic model answer — and swap in a deliberately malicious test doc to confirm injected instructions inside retrieved content are not followed.

---

## Phase 5 — Persistent Chat + Tool Calling + Human Approval
**Goal:** The project becomes a stateful thing you can converse with and change safely.

- Chat tab: streaming, project-scoped, grounded in stored state (not stateless).
- `lib/tools/*` — `getProject`, `updateRequirement`, `saveArchitecture`, `createTask`, `searchKnowledgeBase` etc. (TDD-referenced tool list).
- Change-impact analysis: proposed changes render as a diff + "Impact: affected areas" card before write.
- Explicit Accept/Reject UI — nothing mutates project state without the user clicking Accept (PRD §7.6).
- "Why did you choose X" queries answered from the Decision log first.

**Definition of Done:** "Add payments" in chat produces a visible impact analysis and a pending-approval proposal — accepting it updates requirements/architecture/roadmap together and logs a new Decision; rejecting it changes nothing.

---

## Phase 6 — Export System
**Goal:** The blueprint is immediately usable outside ForgeFlow.

- `/api/projects/:id/export` — generates `README.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md`, `.env.example` from current project state.
- Combined single-file Markdown export + zipped multi-file export.
- Documents tab: preview + download.

**Definition of Done:** Export a real project you built in ForgeFlow, drop the files into a fresh empty repo, and the docs alone are coherent enough to start building from.

---

## Phase 7 — Polish, Hardening, Deployment Readiness
**Goal:** Production-readiness pass against your own review checklist (portfolio-defensible).

- Accessibility pass (keyboard nav, contrast, semantic HTML) on all core flows.
- SEO pass on the public marketing page only (authenticated app stays noindex).
- Loading/skeleton states audited across every data-fetching surface.
- Error boundaries around every AI-touching panel; verify graceful degradation when a provider is forcibly failed in a test.
- Rate-limit behavior verified under actual load (hit the limit on purpose, confirm 429 + clear UI messaging, not a hang).
- README finalized with setup instructions, architecture summary, and screenshots/GIF.
- Final Vercel deployment, smoke-tested end-to-end on a clean browser session.

**Definition of Done:** A stranger can clone the repo, follow the README, fill in their own free-tier API keys, and get the full system running locally within 15 minutes.

---

## Explicit Overengineering Guardrail

Do **not** pull forward any of the following before its assigned phase, even if it seems easy in the moment:
- Multi-agent "10 independent agents" architecture — it's one StateGraph with nodes, always.
- Full RAG before Phase 4.
- Tool-calling/agentic writes before Phase 5.
- GitHub issue sync, Jira/Notion export, collaborative multi-editor, payments — **not in this roadmap at all**; they're PRD non-goals, not later phases.

If Antigravity is ever unsure whether to build something now, the answer is: build the smallest version that makes the *current* phase's Definition of Done true, and stop.

## Suggested Commit Checkpoints Per Phase

Each phase above should map to roughly 6–15 commits (not one commit per phase, not one commit per file). Example granularity for Phase 1:

```
feat(db): add Project, Feature, Decision, RoadmapItem prisma models
feat(db): initial migration for project models
feat(dashboard): project list page with empty state
feat(dashboard): create project form (idea text + optional fields)
feat(dashboard): skeleton loading state for project list
feat(projects): workspace shell with tab navigation
feat(projects): delete and rename project actions
fix(auth): enforce ownership check on project queries
test(projects): ownership isolation test between two users
docs: update README with Phase 1 status
```

See the master prompt for the full commit-message convention.
