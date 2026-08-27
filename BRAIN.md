# BRAIN.md — ForgeFlow AI build memory

## Snapshot

ForgeFlow AI is a Next.js 16.2.9 app that turns a one-line software idea into a structured, reasoned, implementation-ready blueprint using LangGraph.js agent orchestration, Clerk auth, and Supabase/Postgres. **Current phase: Phase 1 complete.** Full project CRUD, seed data, workspace tab layout, and single-tenant user ownership enforcement are operational.

## Where things actually live

- **Route structure**: `app/(marketing)/` = landing page; `app/(auth)/sign-{in,up}/` = Clerk auth pages; `app/(app)/` = authenticated workspace (dashboard, projects)
- **No `src/` dir**: TDD §3 assumed `src/app/...` but the actual scaffold uses root-level `app/`. `@/*` alias resolves to `./*` (repo root).
- **Docs folder**: `Docs/` (capital D), not `docs/`. The OG image lives at `Docs/og-image.png` (source) and `public/og-image.png` (served).
- **Design tokens**: `app/globals.css` — Tailwind v4 `@theme inline` block. 4 brand hex values from og-image.png: navy-900 `#080e1f`, accent-blue `#1a6fff`, accent-cyan `#00d4ff`, accent-muted `#8ab3ff`.
- **Auth**: Clerk. `clerkMiddleware()` in `proxy.ts` (Next 16 convention). `<ClerkProvider>` in `app/layout.tsx`. No local User table. `Project.ownerId` holds Clerk's `userId` directly.
- **Prisma singleton**: `lib/db/prisma.ts` — global instance pattern for Next.js dev hot-reload safety.
- **Server Actions & API**: `lib/actions/project.ts` and `app/api/projects/` REST route handlers with Zod validation (`lib/validations/project.ts`).
- **UI components**: `components/ui/` (Button, Card, Badge, Skeleton) and `components/projects/` (`ProjectCard`, `CreateProjectModal`).
- **Workspace Shell**: `app/(app)/projects/[id]/layout.tsx` (with single-tenant 404 ownership guard), `page.tsx` (Overview), `[tab]/page.tsx` (Requirements, Features, Architecture, Roadmap).
- **Unit Tests**: `tests/unit/ownership.test.ts` verifying single-tenant user isolation.

## Decisions made & why

- **Single-tenant 404 Ownership Guard**: Per TDD §5 — every route handler and Server Action filters by `ownerId === auth().userId`. Unmatched resources return 404 (not 403) to prevent leaking resource existence.
- **Clerk instead of Auth.js**: Master prompt §4 — 50K MAU free tier, eliminates password hashing/session code.
- **No `User` model in Prisma**: Clerk holds user data. `Project.ownerId = Clerk userId` (a String). No FK.
- **Tailwind v4 + hand-written primitives**: `components/ui/` primitives crafted manually to avoid shadcn CLI v4 issues.
- **Local Postgres Credential Encoding**: Password `Warish@786` encoded as `Warish%40786` in connection string URLs.

## Known gotchas

- **URL-encoding password in Postgres URLs**: Password contains `@` which must be encoded as `%40` in connection string URLs (`postgresql://postgres:Warish%40786@localhost:5432/forgeflow`).
- **Prisma `db:generate` post schema updates**: Always run `npm run db:generate` (`npx prisma generate`) whenever `schema.prisma` or dependencies change.
- **`proxy.ts` vs `middleware.ts`**: Next.js 16 rename convention for proxy request interception.

## Current phase & next steps

**Phase 0: COMPLETE** ✓
**Phase 1: COMPLETE** ✓

**Phase 2 next steps** (AI Core & Requirement Synthesis):
1. Configure Groq / Gemini API client setup (`lib/ai/provider.ts`).
2. Implement LangGraph.js workflow graph (`lib/ai/graph.ts`).
3. Build Requirement Synthesis agent node (extracting functional requirements, technical stack, user stories).
4. Build workspace interactive Chat & AI generation interface (`app/(app)/projects/[id]/chat`).
5. Write LLM response parsing and Zod schema validation tests.
