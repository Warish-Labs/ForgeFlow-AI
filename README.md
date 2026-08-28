<p align="center">
  <a href="https://forgeflow.warishlabs.in">
    <img src="public/Logo/forgeflow-logo-gradient.svg" width="130" height="130" alt="ForgeFlow AI Logo" />
  </a>
</p>

<h1 align="center">ForgeFlow AI</h1>

<p align="center">
  <strong>Autonomous Agentic AI Platform for Software Architecture & Implementation Blueprints</strong>
</p>

<p align="center">
  <em>Turn a single-line software concept into a structured, reasoned, implementation-ready engineering blueprint — powered by persistent relational state and human-in-the-loop AI proposal execution.</em>
</p>

<p align="center">
  <a href="https://forgeflow.warishlabs.in" target="_blank">
    <img src="https://img.shields.io/badge/🚀_LIVE_PRODUCTION_DEMO-forgeflow.warishlabs.in-1060ee?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <a href="#key-features"><img src="https://img.shields.io/badge/Next.js-16.0-blue?style=for-the-badge&logo=nextdotjs" alt="Next.js 16" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk Auth" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/LangGraph-JS-FF6B6B?style=for-the-badge" alt="LangGraph" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/Resend-Email-000000?style=for-the-badge&logo=resend" alt="Resend Email" /></a>
  <a href="#key-features"><img src="https://img.shields.io/badge/License-MIT-2fe6b0?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## 🌐 Live Production Application

> 🚀 **Experience ForgeFlow AI live in action:**  
> 👉 **[https://forgeflow.warishlabs.in](https://forgeflow.warishlabs.in)**

---

## 🌟 Why ForgeFlow AI?

Generic AI chat interfaces generate **disposable text** — unvalidated suggestions trapped in chat windows with no persistent state, no decision audit logs, and no understanding of system dependencies.

**ForgeFlow AI replaces disposable chat with relational project state**:
- 🧠 **Persistent Architecture State**: Requirements, tech stacks, data models, ADRs, and roadmaps are stored in a relational PostgreSQL database.
- 🛠️ **Human-in-the-Loop Proposal Engine**: The AI agent analyzes project state and constructs structured **Proposal Cards** with explicit **Accept / Reject** controls.
- ✏️ **Interactive Inline Editor**: Fine-tune software specifications, tech stacks, database schemas, and delivery phases directly on screen.
- 📑 **Exportable Engineering Blueprints**: Synthesize PRDs, Technical Architecture Specs, and Roadmaps into production-ready Markdown packages.
- ✉️ **Admin Broadcast Studio**: Super Admin governance panel with Resend integration for custom HTML waitlist announcements and telemetry monitoring.

---

## 🚀 Platform Capabilities & Modules

| Feature Module | Capabilities |
|---|---|
| 🎯 **Software Vision Engine** | Generates functional/non-functional requirements, target user personas, and core MVP boundaries from prompt inputs. |
| 🏗️ **Architecture & Data Synthesizer** | Designs component topology, entity-relationship schemas, and immutable Architecture Decision Records (ADRs). |
| 📅 **Sequential Delivery Roadmap** | Auto-structures Phase 1 (MVP), Phase 2 (Growth), and Phase 3 (Scale) milestones with prerequisite dependency graphs. |
| 🛡️ **ForgeFlow Agent Copilot** | Context-grounded assistant trained on your exact project state with live Tavily web search capabilities. |
| 📋 **Watchlist & User Telemetry** | PostgreSQL waitlist persistence and Super Admin analytics studio. |
| ✉️ **Custom Resend Email Broadcast** | Live HTML email code & preview studio for broadcasting release notes to waitlist subscribers or registered tenants. |

---

## 🏛️ System Architecture & Workflow Diagrams

### 1. High-Level Platform Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        UI["React 19 / Next.js 16 App Router UI"]
        AdminUI["Super Admin Dashboard & Email Studio"]
    end

    subgraph Auth ["Authentication & Middleware"]
        Clerk["Clerk Auth (Dark Theme)"]
        Proxy["Proxy Guard Middleware (X-Robots-Tag)"]
    end

    subgraph Server ["Server Actions & Agent Engine"]
        ProjectActions["Project Server Actions"]
        AdminActions["Admin & Telemetry Actions"]
        LangGraph["LangGraph.js Orchestrator"]
        ResendEngine["Resend Email Engine"]
    end

    subgraph LLM ["AI Providers & Search"]
        Groq["Groq API (llama-3.3-70b)"]
        Gemini["Google Gemini API (Fallback)"]
        Tavily["Tavily Web Search API"]
    end

    subgraph Storage ["Database & Cache"]
        Prisma["Prisma ORM 6.0"]
        Postgres[(PostgreSQL Database)]
        Upstash[(Upstash Redis Cache)]
    end

    UI --> Clerk
    UI --> Proxy
    Proxy --> ProjectActions
    AdminUI --> AdminActions

    ProjectActions --> LangGraph
    LangGraph --> Groq
    LangGraph --> Gemini
    LangGraph --> Tavily

    ProjectActions --> Prisma
    AdminActions --> ResendEngine
    AdminActions --> Prisma
    Prisma --> Postgres
    ProjectActions --> Upstash
```

### 2. Agent Proposal & Execution Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Engineer / Founder
    participant UI as ForgeFlow Workspace UI
    participant Agent as Agent Execution Engine
    participant LLM as Groq LLM / Tavily
    participant DB as PostgreSQL Database

    User->>UI: Submit architecture proposal prompt / requirement tweak
    UI->>Agent: Trigger processAgentMessageAction(projectId, prompt)
    Agent->>DB: Fetch current relational project state (requirements, tech, entities)
    Agent->>LLM: Synthesize state + user prompt into structured proposal card
    LLM-->>Agent: Return JSON proposal object (adds, edits, removals)
    Agent-->>UI: Render Proposal Card (Pending User Action)
    
    alt User Clicks Accept
        User->>UI: Accept Proposal
        UI->>Agent: Trigger applyProposalAction(projectId, proposalId)
        Agent->>DB: Mutate database entities & log Audit Event
        DB-->>UI: Updated Project State Rendered
    else User Clicks Reject
        User->>UI: Reject Proposal
        UI->>Agent: Discard proposal & record rejection log
    end
```

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Authentication**: [Clerk Auth](https://clerk.com/) (`@clerk/themes` Dark Theme)
- **Database & ORM**: PostgreSQL ([Supabase](https://supabase.com/)) & [Prisma ORM 6.0](https://www.prisma.io/)
- **Agent Orchestration**: [LangGraph.js](https://js.langchain.com/docs/langgraph)
- **LLM Engine**: Groq (`llama-3.3-70b-versatile`) with Google Gemini fallback
- **Email Service**: [Resend SDK](https://resend.com/)
- **Live Search Integration**: [Tavily API](https://tavily.com/)
- **Styling**: Vanilla CSS, Tailwind CSS & Lucide Icons

---

## 💻 Local Setup & Installation

### 1. Prerequisites
- **Node.js**: $\ge 20.9$ (`nvm use 20`)
- **PostgreSQL**: Docker or Supabase database instance

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/warishlabs/ForgeFlow-AI.git
cd ForgeFlow-AI
npm install
```

### 3. Configure Environment Variables
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

Populate `.env.local` keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/dashboard"

DATABASE_URL="postgresql://postgres:password@localhost:5432/forgeflow"
DIRECT_URL="postgresql://postgres:password@localhost:5432/forgeflow"

LLM_PROVIDER="groq"
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=AQ...
TAVILY_API_KEY=tvly-...

ADMIN_EMAIL_1="warishdeveloper@gmail.com"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="ForgeFlow AI <onboarding@resend.dev>"
```

### 4. Sync Database Schema
```bash
npx prisma db push
```

### 5. Launch Development Server
```bash
npm run dev
# App will run at http://localhost:3000
```

---

## 📋 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Compiles optimized Next.js production build |
| `npm run typecheck` | Executes TypeScript strict compiler check (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint syntax and code quality verification |

---

## 📄 License & Author Attribution

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

Developed with ❤️ by **MD Warish Ansari**  
Website: [warishlabs.in](https://warishlabs.in) · GitHub: [github.com/mdwarishansari](https://github.com/mdwarishansari)
