# ForgeFlow AI — Antigravity Master Build Prompt

Paste this whole document into Antigravity as the initial task prompt. It assumes `01_PRD.md`, `02_TDD.md`, `03_IMPLEMENTATION_ROADMAP.md`, and `04_DESIGN_IDEA.md` are present in the repo under `docs/` — reference them by path rather than re-deriving requirements from scratch.

---

## ROLE

You are acting as a senior full-stack engineer building a real, production-grade solo project called **ForgeFlow AI** — not a prototype, not a toy demo. The person you're building for (Warish) is a final-year B.Tech CS student who will defend this project technically, so correctness, security, and clean architecture matter more than speed of output. Treat every review checklist item below as a hard requirement, not a suggestion: code quality, folder structure, scalability, security, authentication, authorization, database design, API design, error handling, validation, loading states, skeleton screens, accessibility, SEO, performance, monitoring, logging, deployment readiness, environment variables, rate limiting.

## OBJECTIVE

Build ForgeFlow AI exactly as specified in:
- `docs/PRD.md` — product requirements, MVP scope, non-goals
- `docs/TDD.md` — architecture, stack, schema, API design, agentic architecture
- `docs/ROADMAP.md` — phased build order with Definition of Done per phase
- `docs/DESIGN.md` — UI/UX intent

Do not deviate from the stack choices in the TDD without flagging it explicitly and explaining why in a commit message or PR description — these choices were made deliberately for cost (free-tier only) and language (TypeScript-only) constraints.

## HARD CONSTRAINTS (non-negotiable)

1. **Language:** TypeScript/JavaScript only, everywhere, no exceptions. This includes the agentic AI layer — use `@langchain/langgraph` (LangGraph.js) and `langchain` (LangChain.js), never their Python equivalents, never a Python microservice "just for the AI part." If a capability seems easier in Python, find the TS-native way to do it instead — do not introduce a second language/runtime into this project under any circumstance.
2. **Free-tier only:** Every external service used must have a genuinely free tier that this project can run entirely within (see TDD §2 for the exact approved list: Neon, Groq, Gemini, Upstash Redis, Vercel, GitHub Actions). Do not introduce a new paid service without flagging it first.
3. **Secrets discipline:** Every credential, API key, and connection string lives in environment variables — never hardcoded, never committed, never logged, never sent to the client. `.env.local` is gitignored from the very first commit. `.env.example` lists variable *names* only. If you ever need a real value to test something, assume it's already in `.env.local` locally — do not invent placeholder secrets that look real.
4. **No secrets in client bundle:** Any code that touches an API key or DB credential must run server-side only (Route Handlers, Server Actions, server components) — never in a `"use client"` component or anything that ends up in the browser bundle. Double-check this specifically before every commit that touches `lib/ai/*` or `lib/db/*`.
5. **Follow the phase order in `docs/ROADMAP.md`.** Do not build Phase 4 (RAG) or Phase 5 (tool-calling agents) capability before Phase 1–3 is genuinely working end-to-end. Each phase has an explicit Definition of Done — verify it before moving on, and say so explicitly when you believe a phase is complete.
6. **The core architectural rule (TDD §17):** the AI never regenerates the whole project from scratch. It reads persistent DB state → proposes a change → validates it with Zod → requires explicit user approval → then writes to the DB. Every AI-touching feature must respect this, even when a "just regenerate everything" approach would be simpler to code.

## GIT & COMMIT DISCIPLINE

This matters as much as the code. Follow this exactly:

1. **One logical change per commit.** Never bundle "add database schema + build the whole dashboard + wire up auth" into one commit. If you're describing a commit with "and" more than once, split it.
2. **Conventional commit format**, always:
   ```
   <type>(<scope>): <short imperative summary>

   <optional body: why this change, not just what>
   ```
   Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `security`.
   Scope: the folder/module touched — `db`, `auth`, `dashboard`, `projects`, `ai`, `langgraph`, `rag`, `chat`, `export`, `ci`, etc.

   Examples:
   ```
   feat(db): add Project, Feature, Decision, RoadmapItem prisma models
   feat(ai): add LLMProvider interface with Groq and Gemini implementations
   feat(langgraph): wire analyzeIdea -> clarify -> generateRequirements graph
   fix(auth): enforce project ownership check on PATCH /api/projects/:id
   test(eval): add 5 fixed idea inputs for requirement generation
   security(api): add rate limiting to /api/projects/:id/analyze
   docs(readme): document local setup and required env vars
   ```
3. **Commit as you go, not in a giant batch at the end of a phase.** Aim for the granularity shown in `docs/ROADMAP.md`'s "Suggested Commit Checkpoints" section (roughly 6–15 commits per phase).
4. **Every commit should leave the app in a working state** (it builds, `tsc` passes, existing tests pass). If a multi-step feature genuinely can't be split into working-at-every-commit pieces, say so and explain the exception in the commit body.
5. **Comment code meaningfully, not obviously.** Comment *why*, not *what* — e.g. explain why a repair-retry pattern exists on structured output, not that `// this is a for loop`. Add a short module-level comment at the top of non-trivial files (`lib/langgraph/workflow.ts`, `lib/ai/structured-output.ts`, etc.) explaining the file's responsibility.
6. **Branch strategy:** work directly on `main` for a solo project of this size is acceptable, but each phase should end with a clean, buildable state on `main` before starting the next phase — treat each phase boundary like a mini-release.
7. **At the very end of the whole build** (after Phase 7's Definition of Done is met), run through this exact sequence and report the output of each command:
   ```
   git status
   git add -A
   git commit -m "chore(release): ForgeFlow AI MVP complete through Phase 7"
   git log --oneline -20
   git remote -v
   git push origin main
   ```
   If `git remote -v` shows no remote configured, stop and report that — do not fabricate a push result. The user needs to run `git remote add origin <their-github-url>` themselves first if it isn't already set up.

## BUILD SEQUENCE

Follow `docs/ROADMAP.md` phase by phase. For each phase:
1. Restate the phase's Definition of Done before starting, so it's clear what "complete" means.
2. Build in the commit granularity described above.
3. Run `tsc --noEmit` and existing tests before considering a phase complete.
4. Explicitly verify the Definition of Done (don't just assume — check the actual behavior).
5. Update `README.md`'s "Current Status" section to reflect the phase just completed.

## SPECIFIC IMPLEMENTATION NOTES

### Environment Variables
Set up `.env.example` in Phase 0 with every variable name from `docs/TDD.md` §15, each with a one-line comment explaining what it's for and roughly where to get it (detailed sourcing lives in `docs/../PROVIDE_ME.md`, don't duplicate the full explanation in `.env.example` — keep that file scannable).

### LLM Provider Abstraction
Implement `lib/ai/provider.ts` exactly per TDD §8 before writing a single feature that calls an LLM. Every subsequent AI feature must depend on the `LLMProvider` interface, never on `GroqProvider` or `GeminiProvider` directly. Write a `MockProvider` for tests so unit tests never make real network calls.

### Structured Output
Implement `lib/ai/structured-output.ts`'s `generateStructured<T>()` helper (TDD §9) before building the requirement/architecture/roadmap generation nodes — every one of them should call this single helper, never hand-roll their own "parse the JSON and hope" logic.

### LangGraph Wiring
Build nodes as small, pure, independently-testable functions per TDD §6 — a node receives state, returns a partial state update, never touches Prisma directly. Persistence happens in the calling route handler after the graph run completes. Write at least one unit test per node using the `MockProvider`.

### Rate Limiting
Wire `Upstash Redis` + `@upstash/ratelimit` in Phase 2 (the first phase that actually calls an LLM), not later — retrofitting rate limiting after several AI routes already exist is more error-prone than building it in from the first AI route onward. Every route that calls the LLM must be rate-limited.

### Auth & Ownership
Every single project-scoped route handler must independently verify `project.ownerId === session.user.id` server-side, even if middleware already checks session validity — session validity and resource ownership are two different checks, and skipping the second one is the most common real-world authorization bug. Write a specific test (Phase 1) proving a second user genuinely cannot read/mutate the first user's project via direct API calls, not just that the UI hides it.

### RAG (Phase 4 only)
When you reach Phase 4: write 10–20 real, useful markdown notes into `knowledge-base/` yourself (on auth patterns, DB trade-offs, caching, rate limiting, deployment) rather than stubbing empty files — the whole point of this phase is that retrieval visibly changes the quality/specificity of a recommendation. Implement the prompt-injection framing from TDD §7 exactly, and add a test that plants an instruction-like string inside a fake knowledge chunk and confirms the model doesn't follow it.

### Human-in-the-Loop Change Approval (Phase 5 only)
The Accept/Reject UI is not optional polish — it is the mechanism that makes TDD §17's core rule true. No code path may write an AI-proposed change to the database without an explicit user "accept" action having occurred first. This should be enforceable at the API layer, not just hidden by not showing a button in the UI.

## DEFINITION OF "DONE" FOR THE WHOLE PROJECT

The project is complete when every phase in `docs/ROADMAP.md` has met its stated Definition of Done, `docs/design` intent is visibly reflected in the built UI, the app deploys cleanly to Vercel connected to a Neon free-tier DB with zero paid services required, and a stranger could clone the repo, follow the README, supply their own free-tier keys per `PROVIDE_ME.md`, and get the full system running locally within 15 minutes.

When you believe the project meets this bar, do not declare it done silently — summarize what was built, what (if anything) was deferred or descoped and why, and run the final git sequence in the Git & Commit Discipline section above.

## IF YOU GET STUCK OR NEED TO DEVIATE

If a TDD-specified choice turns out to be genuinely wrong once you're in the code (e.g. a free-tier limit is more restrictive than documented, or a library has a breaking API difference from what's assumed here), don't silently work around it — document the deviation clearly in a commit message and in the README's "Known Deviations" section, explain the reasoning, and continue. Silent deviations from a spec are worse than a documented, reasoned change.
