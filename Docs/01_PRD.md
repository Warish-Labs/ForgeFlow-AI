# ForgeFlow AI — Product Requirements Document (PRD)

**Owner:** MD Warish Ansari (WarishLabs)
**Status:** Draft v1.0 — Final-year-project scope
**Stack constraint:** Next.js / TypeScript end-to-end. No Python anywhere (including AI/RAG/agent layers).
**Budget constraint:** Free-tier infrastructure only during build/demo phase.

---

## 1. Problem Statement

People can describe a software idea in a sentence, but they can't easily turn that sentence into a technically coherent build plan. Generic AI chat tools respond with disposable text — a wall of suggestions with no persistent state, no traceable decisions, and no understanding of how a later change (e.g. "add a mobile app") ripples through architecture, database, APIs, and timeline.

Existing planning workflow today is fragmented across notes apps, chat history, and memory — the "why did we pick Postgres over Mongo" answer lives nowhere durable.

## 2. Product Vision

> **ForgeFlow turns a software idea into a structured, reasoned, implementation-ready project blueprint — and keeps reasoning about it as the idea evolves.**

Not "AI project idea generator" (too generic). Not "AI project planner" (too weak). The differentiator is: **persistent project state + technical reasoning + iterative AI planning**, not one-shot text generation.

## 3. Target Users (MVP priority order)

1. **Students** (primary — this is your own use case) — final-year/hackathon projects needing structured scope, architecture, and a defensible technical narrative.
2. **Solo developers / indie hackers** — need fast, opinionated technical decisions without a team to argue with.
3. **Small dev teams** (post-MVP) — shared planning artifact before sprint 0.

Not targeting (MVP): enterprises, non-technical founders needing full business planning, agencies.

## 4. Goals (MVP)

- G1: User can describe a vague idea and receive a structured, editable requirement set within one AI turn.
- G2: The system maintains a **persistent project model** (DB-backed), not a disposable chat transcript.
- G3: User gets a reasoned technology recommendation with explicit trade-offs ("why Postgres, not Mongo") — not just a name.
- G4: User can return later, ask "why did you choose X" or "add feature Y", and get an answer/change grounded in the existing project state.
- G5: User can export the blueprint as Markdown documents usable immediately in a real repo (README, PRD, ARCHITECTURE, ROADMAP).
- G6: Entire system runs on free-tier infra (LLM API, DB, hosting) with usage limits enforced so it can't blow past free quotas.

## 5. Non-Goals (explicitly out of scope for MVP)

- Full RAG knowledge base (ships in Phase 4, not MVP — see Roadmap doc).
- Multi-agent LangGraph workflows with tool calling (Phase 5).
- GitHub issue sync, Jira export, Notion export.
- Real-time multiplayer collaboration / multiple editors on one project.
- Payments/billing (no monetization in this build).
- Mobile app (web-only, mobile-responsive).
- Voice interface.

Building these prematurely is the single biggest risk to this project shipping at all — see TDD §16 and Roadmap for the overengineering guardrail.

## 6. Core User Stories (MVP)

| # | As a... | I want to... | So that... |
|---|---------|--------------|------------|
| U1 | Visitor | sign up / log in | I have a private workspace for my projects |
| U2 | User | type a one-line idea | I don't have to fill a huge form to start |
| U3 | User | get asked only the *important* clarifying questions | I'm not annoyed by irrelevant questions (UI color etc.) |
| U4 | User | see my idea converted into structured requirements (users, features, constraints) | I have something concrete to react to, not prose |
| U5 | User | get a tech stack recommendation with reasoning and an alternative | I understand *why*, and can push back |
| U6 | User | see a generated architecture diagram (text/ascii or simple visual) tied to my requirements | I know how the pieces fit together |
| U7 | User | see a roadmap broken into MVP / Phase 2 / Phase 3 | my scope is realistic for my timeline |
| U8 | User | return to a project and chat with it later | context isn't lost between sessions |
| U9 | User | ask "why X" and get an answer sourced from a decision log, not a re-hallucinated guess | trust the system |
| U10 | User | request a change ("add payments") and see what it affects before it's applied | I stay in control of my own project |
| U11 | User | export the whole blueprint as Markdown files | I can drop them straight into a new repo |
| U12 | User | see my AI usage (rough request count) per project | I don't accidentally exhaust free-tier quota |

## 7. Functional Requirements

### 7.1 Project Lifecycle
- Create project (quick: one-line idea, or guided: structured intake form — all fields optional except idea text).
- Each project has: idea, problem statement, target users, structured requirements, features, tech stack, architecture summary, roadmap, decision log, documents, chat history.
- List/dashboard of a user's projects with status (`Planning` / `Architecture` / `Roadmap Ready` / `Exported`).

### 7.2 Requirement Intelligence
- LLM extracts structured requirements (users, features, constraints, assumptions) from free text.
- Output validated against a Zod schema before it's allowed to touch the DB — invalid structured output triggers one automatic repair retry, then surfaces a clear error (never silently drops data).
- Clarification questions are selected by relevance (architecture-impacting) not exhaustiveness.

### 7.3 Technology Recommendation
- Recommend frontend / backend / database / auth / hosting based on requirements.
- Every recommendation includes: choice, 2–4 reasons, one named alternative, and when the alternative would actually be better.
- User-provided constraints (e.g. "must use PostgreSQL") are respected, never overridden silently.

### 7.4 Architecture & Roadmap Generation
- Text/ascii architecture diagram generated from requirements (no unused pieces — e.g. no WebSocket layer unless real-time is a stated requirement).
- Roadmap auto-splits into MVP / Phase 2 / Phase 3 when requested scope exceeds a reasonable timeline for the stated team size — and says so explicitly rather than agreeing to an unrealistic scope.

### 7.5 Persistent Chat
- Chat is scoped per project and grounded in that project's stored state (not a stateless prompt).
- Chat can trigger structured updates to the project (with a preview + explicit "apply" step — see 7.6).

### 7.6 Human-in-the-loop Change Approval
- Any AI-proposed change to requirements/architecture/roadmap is shown as a diff-style proposal with an "Impact" summary before it's written to the DB.
- User must explicitly accept before the project state changes.

### 7.7 Decision Log
- Every accepted technology/architecture decision is stored as a structured record: decision, reasoning, alternative considered, date, affected areas.
- User can query "why did you choose X" and get an answer sourced from this log first, falling back to reasoning over current state only if no log entry exists.

### 7.8 Export
- Export current project state as a Markdown bundle: `README.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md`, `.env.example`.
- Export as single combined Markdown and as a downloadable `.zip` of the file bundle.

### 7.9 Usage Guardrails
- Track approximate request count per project per day.
- Enforce a configurable daily/session limit (env-configurable) to protect free-tier LLM quota; show remaining usage in UI.

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | No secrets in client bundle; all LLM calls server-side only; input validated server-side regardless of client validation. |
| Auth | Session-based auth (Auth.js); project data scoped strictly to owner; no cross-user data leakage. |
| Performance | First contentful paint < 2.5s on dashboard; AI responses stream (no blank spinner > 1s before first token). |
| Reliability | Structured-output failures degrade gracefully (retry once, then explicit error — never a corrupted DB write). |
| Accessibility | Keyboard-navigable core flows; semantic HTML; color contrast AA minimum on all text. |
| SEO | Marketing/landing page server-rendered with proper meta tags; authenticated app pages `noindex`. |
| Observability | Every AI/agent call logged with duration, token estimate, and status (success/error/retried). |
| Cost | Zero paid infrastructure required to run the full MVP end-to-end. |

## 9. Success Metrics (for your own evaluation / demo, not vanity SaaS metrics)

- A brand-new idea (one sentence) reaches a complete, exportable blueprint (requirements → stack → architecture → roadmap) in under 5 minutes of interaction.
- Structured-output validation pass rate ≥ 95% (measured against your own test idea set — see TDD §16 Testing Strategy).
- Zero secrets ever appear in a client-side network request (verifiable by inspecting devtools network tab).
- Demoable end-to-end on the free tiers listed in the TDD with no credit card required.

## 10. Constraints Driving Every Downstream Decision

1. **Language constraint:** TypeScript/JavaScript only. LangGraph.js (`@langchain/langgraph`), LangChain.js (`langchain`), not the Python equivalents, anywhere in the stack.
2. **Cost constraint:** Every service chosen must have a genuinely usable free tier (see TDD §2 for the exact list).
3. **Solo-developer constraint:** No infrastructure that requires a team to operate (no self-hosted Kafka, no k8s cluster, no separate microservices for v1).
4. **Time constraint:** This is a final-year project with a real deadline — the roadmap is explicitly phased so a *smaller* working system exists at every checkpoint, never a big-bang release.

## 11. Risks & Assumptions

| Risk | Mitigation |
|---|---|
| Free-tier LLM rate limits interrupt demos | Provider abstraction (Groq primary, Gemini fallback) — see TDD §8 |
| Structured output drifts / breaks JSON | Zod validation + one repair retry + explicit typed error, never silent corruption |
| Scope creep into full agentic/RAG system before MVP works | Roadmap enforces MVP-first; Phase 4/5 gated behind a working Phase 1–3 |
| pgvector free-tier DB storage limits | Cap knowledge base size in Phase 4; document the limit |
| Solo dev time constraints vs. final-year deadline | Roadmap phases are individually demoable — you can stop after any phase and still have a coherent project |

## 12. Open Questions (resolve before/while Antigravity builds — flagged, not blocking)

- Auth provider: Auth.js with email/password + optional GitHub OAuth, or a hosted auth free tier (Clerk)? (TDD recommends Auth.js — zero vendor lock, fully free, fits "keep it in env" instruction.)
- Which free Postgres host: Neon vs Supabase? (TDD recommends **Neon** — native branching, generous free tier, pgvector supported.)
- Primary LLM: Groq (fastest free tier, Llama family) chosen as default; Gemini as documented fallback via the same provider interface.
