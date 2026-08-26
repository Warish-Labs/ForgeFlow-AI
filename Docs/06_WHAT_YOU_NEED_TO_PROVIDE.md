# PROVIDE_ME.md — What You Need To Provide

**⚠️ Add this exact filename to `.gitignore` before your first commit.** It's a checklist for you personally — nothing in it should reach GitHub. Suggested `.gitignore` line:
```
PROVIDE_ME.md
```
(This is on top of the standard `.env*.local` ignores — this file is separate because it may contain notes-to-self, not just key values.)

Copy this file into your repo root, work through it, then keep the real values in `.env.local` (already gitignored by the Next.js default `.gitignore`).

---

## 1. Database — Neon (free tier)
- Sign up: https://neon.tech (GitHub login is fine, no card required for free tier)
- Create a project → copy the **pooled connection string** → `DATABASE_URL`
- Copy the **direct connection string** → `DIRECT_URL` (Prisma migrations need this)
- Enable the `pgvector` extension when you reach Phase 4 (one SQL command, Neon supports it on free tier)

## 2. Auth — Auth.js (no external account needed)
- `NEXTAUTH_URL` = `http://localhost:3000` for local dev, your Vercel URL in production
- `NEXTAUTH_SECRET` — generate with:
  ```
  openssl rand -base64 32
  ```
- (Optional) GitHub OAuth app for social login: https://github.com/settings/developers → New OAuth App → gives you `GITHUB_ID` / `GITHUB_SECRET`. Not required for MVP — credentials-only auth works fine without this.

## 3. Primary LLM — Groq (free tier)
- Sign up: https://console.groq.com
- Create an API key → `GROQ_API_KEY`
- Free tier gives generous request/token limits on Llama models — good enough for building and demoing.

## 4. Fallback LLM + Embeddings — Google AI Studio (Gemini, free tier)
- Sign up: https://aistudio.google.com
- Create an API key → `GOOGLE_GENERATIVE_AI_API_KEY`
- Used both as the fallback text model and for embeddings (`text-embedding-004`) in Phase 4.

## 5. Rate Limiting — Upstash (free tier)
- Sign up: https://upstash.com
- Create a Redis database (free tier) → copy REST URL and token
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 6. Hosting — Vercel (free tier)
- Sign up: https://vercel.com (connect your GitHub account)
- Import the repo once it exists on GitHub
- Add all the env vars above in Vercel's Project Settings → Environment Variables (same names, real values — never commit these)

## 7. GitHub Repo
- Create an empty repo (no README/license auto-generated, since Antigravity/you will create those) at:
  `https://github.com/mdwarishansari/forgeflow-ai` (or whatever name you prefer)
- Locally, once Antigravity has scaffolded the project:
  ```
  git init
  git remote add origin https://github.com/mdwarishansari/forgeflow-ai.git
  git branch -M main
  ```
  (Antigravity's build prompt handles commits from here — see `05_ANTIGRAVITY_MASTER_PROMPT.md` §"Git & Commit Discipline".)

## 8. Local `.env.local` — final checklist
Once you have all values above, your `.env.local` should contain:
```
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
LLM_PROVIDER=groq
GROQ_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
EMBEDDING_PROVIDER=gemini
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GITHUB_ID=
GITHUB_SECRET=
AI_DAILY_REQUEST_LIMIT=50
```

## 9. Things you do NOT need to pay for
Everything above has a free tier sufficient for building and demoing this project. If at any point Antigravity suggests a service without a usable free tier, that's a deviation from `docs/TDD.md` §2 — push back on it rather than adding a card.

## 10. Sanity check before you start building
- [ ] Neon project created, both connection strings copied
- [ ] `NEXTAUTH_SECRET` generated
- [ ] Groq API key created
- [ ] Gemini API key created
- [ ] Upstash Redis database created, REST credentials copied
- [ ] GitHub repo created (empty)
- [ ] Vercel account connected to GitHub (can wait until Phase 0's deploy step)
- [ ] `PROVIDE_ME.md` added to `.gitignore`
