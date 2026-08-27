# BRAIN.md — ForgeFlow AI build memory

## Snapshot

ForgeFlow AI is a Next.js 16.2.9 app that turns a one-line software idea into a structured, reasoned, implementation-ready blueprint using LangGraph.js agent orchestration, Clerk auth, and Supabase/Postgres. **Current phase: Phase 0 complete.** A user can visit the landing page, sign up/in via Clerk, and see the empty dashboard. No AI features yet — those start Phase 2.

## Where things actually live

- **Route structure**: `app/(marketing)/` = landing page; `app/(auth)/sign-{in,up}/` = Clerk auth pages; `app/(app)/` = authenticated workspace (dashboard, projects)
- **No `src/` dir**: TDD §3 assumed `src/app/...` but the actual scaffold uses root-level `app/`. `@/*` alias resolves to `./*` (repo root).
- **Docs folder**: `Docs/` (capital D), not `docs/`. The OG image lives at `Docs/og-image.png` (source) and `public/og-image.png` (served).
- **Design tokens**: `app/globals.css` — Tailwind v4 `@theme inline` block. 4 brand hex values from og-image.png: navy-900 `#080e1f`, accent-blue `#1a6fff`, accent-cyan `#00d4ff`, accent-muted `#8ab3ff`.
- **Auth**: Clerk. `clerkMiddleware()` in `middleware.ts`. `<ClerkProvider>` in `app/layout.tsx`. No local User table. `Project.ownerId` holds Clerk's `userId` directly.
- **Prisma singleton**: `lib/db/prisma.ts` — global instance pattern for Next.js dev hot-reload safety.
- **UI components**: `components/ui/` — hand-written shadcn-style (Button, Card, Badge, Skeleton). shadcn CLI couldn't initialize due to Tailwind v4 vs v3 detection gap. Runtime deps (CVA, clsx, tailwind-merge, lucide-react, Radix UI) are installed.
- **LLM provider swap point**: `lib/ai/provider.ts` (to be created Phase 2) — reads `LLM_PROVIDER` env var.
- **DB client**: `lib/db/prisma.ts` — singleton, safe for hot-reload.
- **Ownership check**: Per TDD §5 and master prompt §4 — every route handler must independently re-check `project.ownerId === auth().userId`. This is **not** a middleware concern, it's per-route.

## Decisions made & why

- **Clerk instead of Auth.js**: Master prompt §4 — Warish's standing preference, 50K MAU free tier, eliminates password hashing/session code for zero benefit at demo scale.
- **No `User` model in Prisma**: Clerk holds user data. `Project.ownerId = Clerk userId` (a String). No FK. Syncing profile data via webhooks deferred until actually needed.
- **Tailwind v4 + shadcn**: shadcn CLI doesn't support Tailwind v4's CSS-only config — had to hand-write the `components/ui/` primitives. `tailwind.config.ts` stub exists only to satisfy tooling that checks for it (not actually driving styles).
- **Root-level `app/`** (no `src/`): Matched actual scaffold. `tsconfig.json` `@/*` → `./*` already correct for this.
- **`Docs/` with capital D**: Kept as-is to avoid git confusion. README documents it.
- **Design tokens from og-image**: 4 hex values extracted visually: `#080e1f` (navy base), `#0d1529` (surface), `#1a6fff` (blue accent), `#00d4ff` (cyan glow). Expressed as CSS variables in `globals.css`.
- **`next build` no longer auto-lints**: Next.js 16 changed this. `lint` is now an explicit script, and `eslint: { ignoreDuringBuilds: true }` in `next.config.ts`.

## Conventions established

- **API error shape**: `{ error: { code: string, message: string } }` — all route handlers must return this on failure, never a raw stack trace.
- **Ownership check**: return 404 (not 403) on a non-owned resource — don't leak existence. Pattern: `if (!project || project.ownerId !== userId) return notFound()`.
- **Component files**: No default exports for UI primitives — named exports only (e.g., `export { Button }`).
- **Absolute imports**: `@/components/...`, `@/lib/...` etc. — works because `tsconfig.json` `paths: { "@/*": ["./*"] }`.
- **No inline styles in components**: Use CSS variables via Tailwind classes (`text-[var(--text-primary)]`).
- **Commits**: Conventional commit format, 6–15 per phase, every commit leaves build passing.

## Known gotchas

- **npm approve-scripts**: This environment requires `npm approve-scripts <pkg>` before install scripts run. Affected packages: `prisma`, `@prisma/client`, `@prisma/engines`, `@clerk/shared`, `esbuild`, `sharp`. Always run `npm install` → approve any flagged scripts → `npm install` again.
- **shadcn CLI vs Tailwind v4**: `npx shadcn init` fails because it looks for `tailwind.config.ts` with a v3-style `content` array. The stub `tailwind.config.ts` exists but shadcn's check still fails. Components are hand-written instead.
- **`app/favicon.ico`**: The original Next.js scaffold ships a default `favicon.ico` in `app/`. The custom `app/icon.tsx` generates a programmatic one — Next.js uses `icon.tsx` over `favicon.ico` when both exist. Left `favicon.ico` in place as fallback.
- **Prisma `postinstall` in CI**: `"postinstall": "prisma generate"` in `package.json` means `npm install` in CI/Vercel auto-generates the client. Requires `prisma` in `devDependencies` (it is).
- **`next-env.d.ts`** is auto-generated by Next.js — it's in `.gitignore`, don't commit it.
- **`DIRECT_URL` for migrations**: Supabase/Neon require a non-pooled connection for `prisma migrate`. Docker postgres:16 uses the same URL for both — OK for local dev.

## Current phase & next steps

**Phase 0: COMPLETE** ✓

**Phase 1 next steps** (no AI yet):
1. Add full Prisma model relationships, run `npm run db:migrate` once Postgres is running
2. Seed script (`prisma/seed.ts`) with 2–3 realistic example projects
3. Dashboard project list with real data, skeleton loading states
4. Create-project form (idea text + optional guided fields)
5. Project workspace shell with tab navigation (all tabs placeholder)
6. Delete/rename project with ownership enforcement
7. Write ownership isolation test
