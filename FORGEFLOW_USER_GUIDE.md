# 🚀 ForgeFlow AI — Complete System & Usage Guide

> **ForgeFlow AI** is an AI-orchestrated development environment designed to transform high-level software ideas into structured, reasoned, and validated technical implementation blueprints.

---

## 🌟 What Can ForgeFlow AI Do?

ForgeFlow AI moves beyond simple "one-shot AI chat answers" by maintaining a **persistent project state** across five core technical dimensions:

1. **AI Requirement Synthesis**:
   - Analyzes your raw software vision statement.
   - Extracts formal **Problem Statements**, **Functional Requirements**, **Non-Functional Requirements** (scalability, security, latency), and recommended **Tech Stack Tags**.
   - Extracts structured **Feature Cards** categorized by release phase (`MVP`, `Phase 2`, `Phase 3`).

2. **Technical Architecture Modeling & ADR Tracking**:
   - Synthesizes modular **System Topology Models** (Frontend, Server Actions, Database, Cache, Auth, LLM abstraction).
   - Generates formal **Architecture Decision Records (ADRs)** detailing technical trade-offs, rationale, and explicitly rejected alternative tech options.

3. **Implementation Roadmap Synthesis**:
   - Generates sequential release milestones (`MVP`, `Phase 2`, `Phase 3`).
   - Tracks explicit **Prerequisite Dependencies** between roadmap items so engineers know what to build first.

4. **Interactive AI Copilot Chat Drawer**:
   - Built-in contextual AI Assistant that knows your project's exact requirements, database schemas, and decision history.
   - Proactively answers technical questions and asks clarifying questions when project details are underspecified.

5. **Technical Blueprint Export (.md)**:
   - One-click export that compiles your entire project vision, extracted requirements, architecture decision log, entity schema suggestions, and delivery roadmap into an implementation-ready `.md` file.

6. **Zero-Unvalidated-LLM-Output Security**:
   - All AI LLM outputs pass through a `cleanJsonText` processor and strict **Zod validation schemas** before any data is written to the database.

---

## 🛠️ Step-by-Step: How to Use ForgeFlow AI

### Step 1: Create a Project Blueprint
1. Log in to **ForgeFlow AI** at `http://localhost:3000`.
2. On your **Dashboard**, click the **"+ New Blueprint"** button.
3. Enter your **Project Name** (e.g., *EcoTrack — Fleet Carbon Emissions Engine*).
4. Enter your **Software Idea & Vision** (or click **"✨ Auto-Fill Demo Idea"** for a instant sample template).
5. Specify your **Target Tech Stack** (e.g., `Next.js 16, PostgreSQL, Prisma, Redis, TailwindCSS`).
6. Click **Create Project**. You will be taken to your project's **Workspace Tabs**.

---

### Step 2: Analyze Vision (Requirements Synthesis)
1. In the top right header of your project workspace, click **"Analyze Vision"**.
2. ForgeFlow AI runs a **LangGraph.js agentic workflow** to process your idea statement.
3. Navigate to the **Requirements Tab** to review:
   - Problem Statement
   - Functional & Non-Functional Requirements
   - Suggested Tech Stack
4. Navigate to the **Features Tab** to review auto-extracted features grouped by release phases.

---

### Step 3: Generate System Architecture (ADR Decision Log)
1. Navigate to the **Architecture Tab**.
2. Click **"Generate Architecture"**.
3. ForgeFlow AI will model your system topology and generate **Architecture Decision Records (ADRs)**.
4. Review decision cards detailing:
   - Why specific databases or frameworks were chosen.
   - Security strategies (e.g., single-tenant data isolation).
   - Tech trade-offs and rejected alternative frameworks.

---

### Step 4: Generate Implementation Roadmap
1. Navigate to the **Roadmap Tab**.
2. Click **"Generate Roadmap"**.
3. ForgeFlow AI will synthesize sequential release milestones (`MVP`, `Phase 2`, `Phase 3`).
4. View the ordered milestone cards and dependency links showing prerequisite tasks.

---

### Step 5: Ask Technical Questions via AI Copilot
1. Click the **"AI Copilot"** button in the top header to slide open the context-aware chat drawer.
2. Ask questions such as:
   - *"How should I structure the database tables for this project?"*
   - *"Why did we choose PostgreSQL over MongoDB?"*
   - *"What authentication flow should we use for Clerk?"*
3. The AI Copilot will respond using your project's active state and decision log as context.

---

### Step 6: Export Technical Blueprint (.md)
1. Navigate to the **Roadmap Tab** (or project overview).
2. Click **"Export Blueprint (.md)"**.
3. ForgeFlow AI compiles your entire project into a clean, markdown file (`[project-name]-blueprint.md`) ready to hand off to software engineers or import into AI coding tools.

---

## 🏗️ Technical Stack & Architecture

- **Frontend & App Framework**: Next.js 16.2.9 (App Router, Turbopack, React 19)
- **Styling**: Modern dark-mode UI, custom CSS variables, TailwindCSS v4
- **Database & ORM**: PostgreSQL + Prisma ORM (Single-tenant isolation `ownerId === auth().userId`)
- **Caching & Rate Limiting**: Local Redis 7 container / Upstash REST fallback
- **Authentication**: Clerk Authentication (`@clerk/nextjs`)
- **AI Engine & Workflow**: LangGraph.js, Groq Llama-3.3-70B, Google Gemini 1.5/2.0
- **Data Validation**: Strict Zod schemas (`lib/validations/`) for zero unvalidated LLM output corruption
