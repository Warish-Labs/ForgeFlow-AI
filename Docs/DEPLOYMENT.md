# ForgeFlow AI — Deployment & Production Guide
> Target Deployment Domain: `forgeflow.warishlabs.in`

---

## 1. Vercel Deployment Configuration

When deploying ForgeFlow AI on **Vercel**, use the following exact settings in the Vercel Dashboard project configuration:

| Setting | Value / Details |
| :--- | :--- |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `./` (Leave default/blank) |
| **Build Command** | `npm run db:deploy && npm run build` *(Runs migration + initial seed check before building Next.js)* |
| **Install Command** | `npm install` (or default `npm ci`) |
| **Output Directory** | `.next` (Next.js default) |
| **Node.js Version** | `20.x` or higher |

---

## 2. Root Directory — Files & Structure to Keep

Ensure your Git repository includes all essential configuration, schema, and application files when deploying:

### ✅ Keep in Root Directory (Commit to Git):
```text
ForgeFlow-AI/
├── app/                      # Next.js App Router (pages & layout)
├── components/               # UI components & design system
├── lib/                      # Business logic, Prisma client, AI orchestration
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Initial demo seed data
│   └── migrations/           # Prisma migration history
├── public/                   # Static media assets & icons
├── scripts/
│   └── db-deploy.ts          # Automated deployment script (migration + initial seed check)
├── .env.example              # Environment variables template
├── .gitignore                # Target ignores (node_modules, .next, .env.local)
├── docker-compose.yml        # Local development setup (Optional for Vercel)
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and script definitions
├── package-lock.json         # Locked dependency versions
├── postcss.config.mjs        # PostCSS configuration
├── proxy.ts                  # Reverse proxy / route wrapper
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

### ❌ Exclude from Version Control (Handled by `.gitignore`):
- `node_modules/` (Installed dynamically during build)
- `.next/` (Generated output directory)
- `.env.local` / `.env.production` (Secrets must be added directly into Vercel Environment Variables)

---

## 3. Automated Database Command (`npm run db:deploy`)

ForgeFlow AI includes a single unified database deployment script designed for automated CI/CD pipelines and Vercel builds:

```bash
npm run db:deploy
```

### How `npm run db:deploy` Works:
1. **Migration Execution (Every Deployment)**:
   Runs `npx prisma migrate deploy` to check and apply any pending schema changes automatically.
2. **Smart First-Time Seeding (First Deployment Only)**:
   Checks `prisma.project.count()`:
   - **First Deployment (Empty DB / 0 Projects)**: Executes `npx tsx prisma/seed.ts` to populate demo data.
   - **Subsequent Deployments**: Detects existing data and **automatically skips** seeding to preserve production user data.

---

## 4. Docker & Upstash Redis — Architecture & Purpose

### Why Docker is NOT Needed on Vercel Deployment:
- **Vercel** hosts Next.js serverless functions natively without needing custom containerization.
- **Upstash Redis** is a managed **serverless cloud service**. You communicate with Upstash via HTTP REST API (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`). You **do not** need to run or containerize a Redis server process in production.
- **Neon PostgreSQL** is a managed serverless cloud database connected via `DATABASE_URL` and `DIRECT_URL`.

### Why Docker is Included in the Repository:
1. **Local Development (`docker-compose.yml`)**:
   Enables full offline local development with a local PostgreSQL container (`port 5433`) and local Redis container (`port 6379`) without relying on cloud credentials.
2. **Self-Hosting Alternative (`Dockerfile`)**:
   Provided if you decide to host outside Vercel (e.g. AWS EC2, DigitalOcean Droplet, GCP Cloud Run, or custom VPS).

---

## 5. Step-by-Step Vercel Deployment Workflow

### Step 1 — Setup Neon Database
1. Create a project at [neon.tech](https://neon.tech) named `forgeflow`.
2. Copy **Connection string (pooled)** → `DATABASE_URL`
3. Copy **Direct connection** → `DIRECT_URL`

### Step 2 — Setup Clerk Authentication
1. Create application at [clerk.com](https://clerk.com).
2. Configure **Allowed Redirect URLs**:
   - `https://forgeflow.warishlabs.in/sign-in`
   - `https://forgeflow.warishlabs.in/sign-up`
   - `https://forgeflow.warishlabs.in/dashboard`
3. Copy Keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Step 3 — Upstash Redis Setup (Optional / Phase 2 Cache)
1. Create Redis database at [upstash.com](https://upstash.com).
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### Step 4 — Configure Vercel Project & Environment Variables
In Vercel Dashboard → **Project Settings** → **Environment Variables**, add:

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-host.neon.tech/forgeflow?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-host.neon.tech/forgeflow?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App Configuration
NEXT_PUBLIC_APP_URL=https://forgeflow.warishlabs.in

# AI Engine Providers
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=...
TAVILY_API_KEY=tvly-...

# Cache (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Super Admin & Quotas
ADMIN_EMAIL_1=warishprojects@gmail.com
ADMIN_EMAIL_2=warishlabs@gmail.com
FREE_MAX_PROJECTS=1
FREE_AI_TOKEN_LIMIT=50000
FREE_AI_REQUEST_LIMIT=50
```

### Step 5 — Custom Domain Configuration
In Vercel Dashboard → **Settings** → **Domains** → Add `forgeflow.warishlabs.in`:
```text
Type: CNAME
Name: forgeflow
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 6. Post-Deployment Verification Checklist

- [ ] Visit `https://forgeflow.warishlabs.in` — Landing page renders properly.
- [ ] Test Clerk authentication sign-in / sign-up flow.
- [ ] Verify project creation and AI architecture synthesis.
- [ ] Visit `https://forgeflow.warishlabs.in/admin` with `ADMIN_EMAIL_1` credentials.
- [ ] Check Vercel deployment build logs to confirm `npm run db:deploy` completed migration and initial seed check.
