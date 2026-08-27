# ForgeFlow AI

> Turn a software idea into a structured, reasoned, implementation-ready blueprint — and keep reasoning about it as the idea evolves.

**Stack:** Next.js 16 · TypeScript · Clerk · Prisma · Supabase Postgres · LangGraph.js · Groq/Gemini · Tailwind v4 · Vercel

[![Phase](https://img.shields.io/badge/Phase-1%20in%20progress-blue)](#current-status)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## What is ForgeFlow AI?

Generic AI chat gives you disposable text — a wall of suggestions with no persistent state, no traceable decisions, and no understanding of how a later change ripples through your architecture.

ForgeFlow is different: **persistent project state + technical reasoning + iterative AI planning**. Every requirement, technology choice, and architecture decision is stored, reasoned about, and attributable. Ask "why Postgres?" and get an answer from the decision log, not a re-hallucination.

The differentiator: **the AI never regenerates from scratch — it reads state → proposes a change → validates it → requires your approval → then updates state.** Human-in-the-loop is a core product constraint, not an afterthought.

---

## Current Status

| Phase | Status | Notes |
|---|---|---|
| 0 — Scaffolding | ✅ Complete | Clerk auth, Prisma schema, design tokens, landing page |
| 1 — Project CRUD | 🔄 In progress | — |
| 2 — Requirement Intelligence (first AI) | ⬜ Pending | — |
| 3 — Tech Stack + Architecture + Roadmap | ⬜ Pending | — |
| 4 — RAG Knowledge Base | ⬜ Pending | — |
| 5 — Persistent Chat + Tool Calling | ⬜ Pending | — |
| 6 — Export System | ⬜ Pending | — |
| 7 — Polish + Deployment | ⬜ Pending | — |

---

## Setup (15-minute bar)

### Prerequisites

- Node.js ≥ 20.9 (use `nvm use` — `.nvmrc` is committed)
- Docker (for local Postgres) **or** Supabase CLI
- Accounts (all free, no credit card): [Clerk](https://dashboard.clerk.com), [Groq](https://console.groq.com), [Upstash](https://upstash.com) (Phase 2+)

### 1. Clone and install

```bash
git clone https://github.com/warishlabs/ForgeFlow-AI.git
cd ForgeFlow-AI
npm install
```

### 2. Start local Postgres

```bash
# Option A — Docker Compose (simplest)
docker compose up -d

# Option B — Supabase CLI
supabase start  # prints a local connection string
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local and fill in:
#   DATABASE_URL + DIRECT_URL  (local Postgres or Supabase local)
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY  (dashboard.clerk.com)
# Phase 2+ keys (GROQ_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, Upstash) can wait
```

### 4. Run migrations and seed

```bash
npm run db:migrate      # creates schema in local Postgres
# npm run db:seed       # (Phase 1+) adds example projects
```

### 5. Start dev server

```bash
npm run dev
# → http://localhost:3000
```

### Verify

- Landing page loads at `/`
- Sign up → Clerk creates a user → redirect to `/dashboard`
- Dashboard shows empty state
- `/dashboard` without auth redirects to `/sign-in`

---

## Project Structure

```
ForgeFlow-AI/
├── app/
│   ├── (marketing)/page.tsx     # Public landing page (SEO'd, full brand)
│   ├── (auth)/sign-in|sign-up/  # Clerk prebuilt auth UI
│   ├── (app)/                   # Authenticated workspace (noindex)
│   │   ├── layout.tsx           # App shell with header + UserButton
│   │   └── dashboard/page.tsx   # Project list (Phase 1 fills this in)
│   ├── layout.tsx               # Root — ClerkProvider, metadata, fonts
│   ├── globals.css              # Design tokens from og-image brand
│   ├── icon.tsx                 # Programmatic favicon (FF monogram)
│   └── sitemap.ts               # Public-routes-only sitemap
├── components/
│   ├── ui/                      # Button, Card, Badge, Skeleton
│   └── shared/Logo.tsx          # FF monogram logo component
├── lib/
│   ├── db/prisma.ts             # Prisma singleton client
│   ├── utils.ts                 # cn() utility
│   └── ai/                      # Phase 2: provider.ts, providers/
├── prisma/
│   └── schema.prisma            # MVP schema (no User model — Clerk)
├── tests/
│   ├── setup.ts
│   ├── unit/                    # Vitest unit tests
│   └── eval/                    # AI evaluation test cases (Phase 2+)
├── middleware.ts                # clerkMiddleware + noindex headers
├── BRAIN.md                     # Build memory — read this first in any new session
├── Docs/                        # Source documentation
│   ├── 01_PRD.md
│   ├── 02_TDD.md
│   ├── 03_IMPLEMENTATION_ROADMAP.md
│   ├── 04_DESIGN_IDEA.md
│   └── og-image.png             # Brand asset (also in public/)
└── docker-compose.yml           # Local Postgres for development
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check (zero errors required) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed example projects (Phase 1+) |

---

## Known Deviations from TDD

| What the TDD specifies | What this build uses | Reason |
|---|---|---|
| Auth.js (NextAuth v5) | **Clerk** | Standing preference; 50K MAU free tier; eliminates session/hashing code |
| Neon Postgres | **Supabase** (hosted), Docker postgres:16 (local) | Matches existing Warish stack; same pgvector support in Phase 4 |
| `src/app/...` structure | **Root-level `app/`** | Matched actual create-next-app scaffold output |
| `docs/` (lowercase) | **`Docs/`** (capital D) | As created; kept to avoid git confusion |
| Groq `llama-3.3-70b-versatile` | Verify at build time | Model IDs shift on ~3–6 month cadence |
| Gemini `gemini-2.5-flash` | Verify at build time | Same reason — treat as a variable |

---

## Architecture (Phase 0 view)

```
Browser
  └── Next.js 16 (App Router, Turbopack)
        ├── (marketing)/* — public, SEO'd, server-rendered
        ├── (auth)/*      — Clerk hosted auth UI
        └── (app)/*       — authenticated workspace, noindex
              ├── clerkMiddleware (middleware.ts)
              ├── Route Handlers (app/api/*)  [Phase 1+]
              ├── Service Layer (lib/services) [Phase 1+]
              └── AI/Agent Layer (LangGraph.js) [Phase 2+]
                    └── LLMProvider (Groq primary / Gemini fallback)
  └── Prisma → Postgres (Supabase / local Docker)
```

---

## License

MIT — see [LICENSE](./LICENSE)

Built by [MD Warish Ansari](https://warishlabs.in) · [WarishLabs](https://warishlabs.in) — Engineering · AI · Impact
