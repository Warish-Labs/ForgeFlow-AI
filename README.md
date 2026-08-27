<p align="center">
  <a href="https://forgeflow.warishlabs.in">
    <img src="public/Logo/forgeflow-logo-gradient.svg" width="120" height="120" alt="ForgeFlow AI Logo" />
  </a>
</p>

<h1 align="center">ForgeFlow AI</h1>

<p align="center">
  <strong>The Autonomous Software Architecture & Specification Engine</strong>
</p>

<p align="center">
  <em>Turn software vision into structured, reasoned, implementation-ready architecture blueprints — with persistent state and human-in-the-loop AI proposal execution.</em>
</p>

<p align="center">
  <a href="#key-features"><img src="https://img.shields.io/badge/Next.js-16.0-blue?style=for-the-badge&logo=nextdotjs" alt="Next.js 16" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk Auth" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/LangGraph-JS-FF6B6B?style=for-the-badge" alt="LangGraph" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/License-MIT-2fe6b0?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## 🌟 Why ForgeFlow AI?

Generic AI chat gives you disposable text — a wall of unvalidated suggestions with no persistent state, no traceable decision history, and no understanding of how later changes ripple through your system.

**ForgeFlow AI changes that paradigm**:
- 🧠 **Persistent Architecture State**: Every requirement, technology badge, data entity, and Architecture Decision Record (ADR) is stored in a single-tenant database.
- 🛠️ **ForgeFlow Agent Proposal Engine**: The AI never rewrites project state blindly — it analyzes state, constructs a structured **Proposal Card**, and waits for explicit user **Accept / Reject** confirmation.
- ✏️ **Full Interactive Workspace**: Edit project vision, system requirements, feature backlogs, tech stacks, ADRs, and delivery roadmaps inline with real-time UI feedback.
- 📄 **Production Markdown Blueprint Export**: Export complete PRD, TDD, entity schemas, and milestone roadmaps as production-ready Markdown documents.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🎯 **Software Vision Synthesis** | Extract structured functional & non-functional requirements from raw prompt ideas using LangGraph.js nodes. |
| 🛡️ **ForgeFlow Agent Copilot** | Context-grounded AI agent trained on your project's exact state with Tavily live search integration. |
| 🏗️ **System Architecture & ADRs** | Synthesize component topology, relational data entities, and immutable Architecture Decision Records. |
| 📅 **Sequential Delivery Roadmap** | Auto-generate Phase 1 (MVP), Phase 2 (Growth), and Phase 3 (Scale) milestones with prerequisite dependency graphs. |
| ✏️ **Interactive Inline Editing** | Modify requirements, tech stacks, features, and milestones directly on screen with instant state validation. |
| 📑 **Document Generation Engine** | Synthesize PRDs, Technical Architecture Specs, and Roadmaps with live Markdown preview and copying. |

---

## 🏛️ System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │              User Browser (UI)               │
                  └──────────────────────┬───────────────────────┘
                                         │
                         Next.js 16 App Router (Turbopack)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌───────────────┐               ┌─────────────────┐             ┌──────────────────┐
│  Clerk Auth   │               │ LangGraph Agent │             │  Prisma / Postgres│
│ Single-Tenant │               │ (Groq / Gemini) │             │ Persistent State │
└───────────────┘               └────────┬────────┘             └──────────────────┘
                                         │
                                ┌────────▼────────┐
                                │ Tavily Web Search│
                                └─────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Authentication**: [Clerk Auth](https://clerk.com/)
- **Database & ORM**: PostgreSQL ([Supabase](https://supabase.com/)) & [Prisma ORM](https://www.prisma.io/)
- **Agent Orchestration**: [LangGraph.js](https://js.langchain.com/docs/langgraph)
- **LLM Providers**: Groq (`llama-3.3-70b-versatile`) with Google Gemini fallback
- **Search Integration**: Tavily API
- **Styling**: Tailwind CSS & Lucide Icons

---

## 💻 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: $\ge 20.9$ (`nvm use`)
- **PostgreSQL**: Docker or Supabase local instance

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/warishlabs/ForgeFlow-AI.git
cd ForgeFlow-AI
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate required keys:
```bash
cp .env.example .env.local
```

Required keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forgeflow"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/forgeflow"
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-...
```

### 4. Database Setup & Migrations
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📋 Available Commands

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build production application bundle |
| `npm run typecheck` | Run TypeScript strict compiler check (`tsc --noEmit`) |
| `npm run test` | Run Vitest unit & evaluation suite |
| `npm run lint` | Run ESLint syntax & code checks |

---

## 📄 License & Attribution

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

Developed with ❤️ by **MD Warish Ansari** · [WarishLabs](https://warishlabs.in)
