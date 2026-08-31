# ForgeFlow AI — User & AI Agent Reference Manual

> **Canonical System Specification & Operational Guide**  
> *For Humans, AI Agents, and Automated Development Workflows*

---

## IF YOU ARE AN AI AGENT (Read This First)

1. **Read Before Modifying**: Read this complete document before making structural or code changes to ForgeFlow AI.
2. **Never Invent State**: Do not invent non-existent database models, fields, or API endpoints. Check actual code implementation in `lib/` and `prisma/schema.prisma`.
3. **Preserve Single-Tenant Isolation**: Always enforce `ownerId: userId` check on project queries and mutations. Never return or mutate resources across user boundaries.
4. **Preserve Central AI Abstraction**: All LLM calls MUST route through `invokeLlmWithFallback()` in `lib/ai/provider.ts`. Do NOT instantiate `ChatGroq` or `ChatGoogleGenerativeAI` directly in feature code.
5. **No Canned LLM Fallbacks in Production**: If an LLM call fails on both primary and fallback providers, propagate a clean diagnostic `ActionResult.error` payload to the UI. Never return canned mock data when API keys exist.
6. **Tool Permission Protocol**: The AI can request tool execution (`PermissionRequestPayload`). Never execute arbitrary tools without explicit server validation and user permission approval.
7. **Keep Guide Updated**: Update this document whenever new server actions, database models, or AI capabilities are added to the codebase.

---

## 1. System Overview & Architecture

### What is ForgeFlow AI?
ForgeFlow AI is an agentic software architecture platform that transforms raw software vision prompts into structured, production-ready engineering blueprints, Architecture Decision Records (ADRs), interactive roadmaps, and dynamic technical documentation.

### High-Level Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Vanilla CSS + Tailwind CSS v4 design tokens (glassmorphism, dark palette)
- **Database**: PostgreSQL 16 + Prisma ORM
- **Authentication**: Clerk (`@clerk/nextjs`)
- **AI Orchestration**: LangGraph.js + LangChain Core
- **LLM Engine**: Groq (`openai/gpt-oss-120b`) + Google Gemini (`gemini-2.5-flash`) fallback
- **Web Search**: Tavily Search API with 1-hour TTL cache
- **Testing & Quality**: Vitest + ESLint + TypeScript strict mode

---

## 2. Core Operations Matrix

| Operation | Purpose | UI Entry Point | Backend Action / Endpoint | AI Provider | Model | Input | Output | DB Mutations | Approval Req. | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Analyze Vision** | Extract requirements & features | "Analyze Vision" button | `analyzeProjectAction` / `createSynthesisGraph` | Groq ➔ Gemini | `openai/gpt-oss-120b` / `gemini-2.5-flash` | `ideaText`, `userAnswers` | `RequirementSynthesisResult` | `Project.requirements`, `Project.status`, `Feature`, `Decision` | Yes (if questions returned) | **IMPLEMENTED** |
| **Architecture Synthesis** | Generate ADRs & system topology | "Generate Architecture" button | `generateArchitectureAction` / `architectureSynthesisNode` | Groq ➔ Gemini | `openai/gpt-oss-120b` / `gemini-2.5-flash` | `projectName`, `ideaText`, `techStack` | `SystemArchitectureSynthesisResult` | `Project.architecture`, `Decision` | No | **IMPLEMENTED** |
| **Roadmap Synthesis** | Generate milestone schedule | "Generate Roadmap" button | `generateRoadmapAction` / `roadmapSynthesisNode` | Groq ➔ Gemini | `openai/gpt-oss-120b` / `gemini-2.5-flash` | `projectName`, `features`, `decisions` | `RoadmapSynthesisResult` | `RoadmapItem`, `Project.status` | No | **IMPLEMENTED** |
| **Document Generation** | Generate Markdown spec docs | "Generate Specification" button | `generateDocumentAction` | Groq ➔ Gemini | `openai/gpt-oss-120b` / `gemini-2.5-flash` | `docType`, live project state graph | Markdown text | `Document` (version incremented) | No | **IMPLEMENTED** |
| **Agent Chat** | Context-grounded AI copilot | Workspace Chat Drawer | `sendChatMessageAction` | Groq ➔ Gemini | `openai/gpt-oss-120b` / `gemini-2.5-flash` | User message + live state graph | Markdown reply + proposal JSON | `ChatMessage`, `ChatSession` | No | **IMPLEMENTED** |
| **Accept Proposal** | Mutate project state from chat | "Accept Proposal" button | `acceptProposalAction` | N/A (Server Action) | N/A | `ProposalPayload` | Updated project field | `Project.*`, `Decision`, `AuditLog` | Yes | **IMPLEMENTED** |
| **Tavily Web Search** | Live tech stack research | Auto in chat / docs | `searchTavily` | Tavily API | `tavily-search` | Query string | Search snippets | `AiUsageLog` | No | **IMPLEMENTED** |

---

## 3. Detailed Operational Specification (Topics 1–74)

### 1. What ForgeFlow AI Is
`Status: IMPLEMENTED`  
An AI software architecture platform that automates software specification, technology selection, architectural decision recording, and milestone planning.

### 2. What a Project Is
`Status: IMPLEMENTED`  
A project is a single-tenant workspace record in PostgreSQL (`Project` table) containing software vision text, requirements JSON, tech stack array, architecture topology JSON, features, ADR decisions, roadmap milestones, chat sessions, and generated documents.

### 3. Project Lifecycle
`Status: IMPLEMENTED`  
Projects transition through statuses:
1. `PLANNING`: Initial vision text creation and requirement synthesis.
2. `ARCHITECTURE`: Requirements synthesized; ADRs and topology generated.
3. `ROADMAP_READY`: Delivery milestones and dependencies generated.
4. `EXPORTED`: Complete blueprint compiled and exportable as Markdown/PDF.

### 4. Authentication
`Status: IMPLEMENTED`  
Managed via Clerk Auth (`@clerk/nextjs`). Authenticated user IDs map to `ownerId` in PostgreSQL tables.

### 5. User Roles
`Status: IMPLEMENTED`  
- `USER`: Regular user with 5-project limit and 50 AI operations/day limit.
- `SUPER_ADMIN`: Access to `/admin` dashboard, global audit logs, user management, and pricing settings.

### 6. Project Ownership
`Status: IMPLEMENTED`  
Single-tenant tenant isolation guarded at database query level (`where: { id: projectId, ownerId: userId }`). Attempts to access unowned projects return `404 Not Found`.

### 7. Project Creation
`Status: IMPLEMENTED`  
Users submit a project `name` and `ideaText` via `/dashboard` modal (`createProjectAction`).

### 8. Project Fields
`Status: IMPLEMENTED`  
`id`, `ownerId`, `name`, `ideaText`, `problemStatement`, `status`, `requirements` (JSON), `techStack` (JSON), `architecture` (JSON), `architectureText`, `assumptions` (JSON), `openQuestions` (JSON), `createdAt`, `updatedAt`.

### 9. Software Vision
`Status: IMPLEMENTED`  
Unstructured text input describing what the user wants to build.

### 10. Target Stack
`Status: IMPLEMENTED`  
Array of strings representing technology choices (e.g., `["Next.js 16", "PostgreSQL", "Prisma", "Tailwind CSS v4"]`).

### 11. Requirements
`Status: IMPLEMENTED`  
JSON object containing `functional` (string array) and `nonFunctional` (string array).

### 12. Features
`Status: IMPLEMENTED`  
Database records in `Feature` table (`id`, `projectId`, `title`, `description`, `phase`, `status`).

### 13. Architecture
`Status: IMPLEMENTED`  
JSON object containing `overview`, `components` array (`name`, `type`, `description`, `tech`), and `dataModels` array (`entity`, `description`, `fields`).

### 14. Architecture Decision Records (ADRs)
`Status: IMPLEMENTED`  
Database records in `Decision` table (`id`, `projectId`, `decision`, `reasoning`, `alternative`, `affectedAreas`).

### 15. Roadmap
`Status: IMPLEMENTED`  
Database records in `RoadmapItem` table (`id`, `projectId`, `title`, `phase`, `status`, `dependsOn`, `order`).

### 16. UI Design
`Status: IMPLEMENTED`  
Dark-mode glassmorphic interface with reactive tabs (`Overview`, `Requirements`, `Architecture`, `Roadmap`, `Decisions`, `Documents`, `Design`).

### 17. Documents
`Status: IMPLEMENTED`  
Database records in `Document` table supporting 10 spec types (`PRD`, `REQUIREMENTS`, `FEATURES`, `STACK`, `ARCHITECTURE`, `ADRS`, `DATABASE`, `SECURITY`, `ROADMAP`, `BLUEPRINT`).

### 18. Agent Chat
`Status: IMPLEMENTED`  
Context-grounded assistant drawer (`ProjectChatDrawer.tsx`) executing `sendChatMessageAction`.

### 19. Analyze Vision
`Status: IMPLEMENTED`  
Executes `analyzeProjectAction` ➔ `createSynthesisGraph` ➔ `requirementSynthesisNode` to extract problem statement, tech stack, requirements, and features.

### 20. AI Document Generation
`Status: IMPLEMENTED`  
Executes `generateDocumentAction` ➔ `buildDocumentSystemPrompt` ➔ `invokeLlmWithFallback` ➔ `cleanMarkdownText` ➔ saves to `Document` table with version increment.

### 21. AI Proposals
`Status: IMPLEMENTED`  
JSON blocks generated by Agent Chat when state mutations are requested (`STACK_CHANGE`, `REQUIREMENT_UPDATE`, `ROADMAP_UPDATE`, `GENERAL_UPDATE`).

### 22. Accept/Reject Proposal Workflow
`Status: IMPLEMENTED`  
User clicks `[ Accept Proposal ]` in `ProposalCard.tsx` ➔ calls `acceptProposalAction` ➔ updates project database field ➔ creates an ADR record ➔ logs `PROPOSAL_ACCEPTED` audit event ➔ revalidates UI path.

### 23. Audit Trail
`Status: IMPLEMENTED`  
Database logging in `AuditLog` table capturing user actions (`PROJECT_CREATED`, `PROJECT_DELETED`, `DOCUMENT_GENERATED`, `PROPOSAL_ACCEPTED`, `AI_QUOTA_TRIGGERED`).

### 24–28. AI Provider Architecture, Groq, Gemini, Fallback & Model Config
`Status: IMPLEMENTED`  
- Central abstraction in `lib/ai/provider.ts`.
- **Groq**: Primary provider (`GROQ_MODEL` default `"openai/gpt-oss-120b"`).
- **Gemini**: Secondary fallback (`GEMINI_MODEL` default `"gemini-2.5-flash"`).
- **Bi-directional Failover**: Governed by `LLM_PROVIDER` (`groq` ➔ Gemini or `gemini` ➔ Groq).
- **Error Classification**: Categorizes errors into `model_not_found` (404), `auth_error` (401/403), `rate_limit` (429), `server_error` (5xx), and `timeout`.

### 29. Environment Variables
`Status: IMPLEMENTED`  
- `DATABASE_URL` (PostgreSQL connection string)
- `DIRECT_URL` (PostgreSQL direct connection string)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `LLM_PROVIDER` (`"groq"` | `"gemini"`)
- `GROQ_API_KEY`
- `GROQ_MODEL` (`"openai/gpt-oss-120b"`)
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GEMINI_MODEL` (`"gemini-2.5-flash"`)
- `TAVILY_API_KEY`

### 30–41. AI Quotas, Tokens, Limits & Usage Accounting
`Status: IMPLEMENTED`  
- **Token Calculation**: Token counts logged per operation in `AiUsageLog` table.
- **Quota Guards**: `checkUserAiQuotaAction` enforces a daily limit of 50 AI operations per user (`DEFAULT_DAILY_AI_QUOTA = 50`).
- **Free User Limit**: 5 projects per user (`DEFAULT_MAX_PROJECTS_PER_USER = 5`).
- **In-Memory Rate Limiter**: 28 RPM limit in `provider.ts` to buffer Groq burst limits per instance.

### 42. Tavily Search & Cache
`Status: IMPLEMENTED`  
Tavily API integration in `lib/tools/tavily.ts` with 1-hour TTL in-memory query cache (`lib/services/tavilyCache.ts`).

### 43. Redis Usage
`Status: PLANNED / NOT IMPLEMENTED`  
Currently using PostgreSQL + in-memory TTL caching. Upstash Redis cache is planned for multi-instance distributed rate limiting.

### 44. Background Jobs
`Status: PLANNED / NOT IMPLEMENTED`  
Currently processing operations asynchronously via Next.js Server Actions. Background queue workers (e.g. BullMQ / Inngest) are planned.

### 45–48. Database, Prisma, PostgreSQL & pgvector
`Status: IMPLEMENTED`  
PostgreSQL database hosted via Supabase/Neon, managed by Prisma ORM (`prisma/schema.prisma`). pgvector extensions are supported in schema.

### 49–51. Auth Provider, Security Model & Server/Client Boundaries
`Status: IMPLEMENTED`  
- Clerk Auth handles session tokens and JWT validation.
- All mutations run strictly as Next.js `"use server"` Server Actions.
- Client components cannot access Prisma or secret environment variables.

### 52–55. AI Prompts, Structured Outputs, Zod Validation & Error Handling
`Status: IMPLEMENTED`  
- Prompt builders in `lib/ai/prompts/chat.ts` and `lib/ai/prompts/document.ts`.
- Structured output validation using Zod schemas (`lib/validations/ai.ts`, `lib/validations/architecture.ts`, `lib/validations/roadmap.ts`).
- Zod preprocessors coerce strings to uppercase enums (`"mvp"` ➔ `"MVP"`), preventing parsing crashes.
- Server actions propagate diagnostic `ActionResult.error.message` to the UI without exposing secret keys.

### 56–62. AI Tool Permissions & Trust Boundary Protocol
`Status: IMPLEMENTED`  
- **Tool Protocol**: Defined in `lib/ai/tools.ts` (`PermissionRequestPayload`).
- **Trust Boundary**: `LLM Request` ➔ `Server Validation` ➔ `User Permission UI` ➔ `Execution Gate`.
- **Permission Card**: Rendered via `PermissionRequestCard.tsx` in chat drawer.
- **Allowed Actions**: `run_python`, `run_javascript`, `run_typescript`, `search_web`, `generate_file`, `modify_project_state`.
- **Read-Only Actions**: Project context Q&A, Tavily web search.
- **State Mutation Actions**: Proposal acceptance, requirement update, architecture generation.

### 63–68. Important UI Buttons & Execution Guide

| Button Name | Location | Server Action Invoked | Expected Output | Failure Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **"Create Project"** | Dashboard Header / Modal | `createProjectAction` | New `Project` record created; redirects to `/projects/[id]` | Error toast displayed |
| **"Analyze Vision"** | Project Header / Overview | `analyzeProjectAction` | Synthesizes requirements, stack, and features; updates status to `ARCHITECTURE` | Red diagnostic error banner |
| **"Generate Architecture"** | Architecture Tab | `generateArchitectureAction` | Synthesizes system topology & ADRs; updates status to `ROADMAP_READY` | Red diagnostic error banner |
| **"Generate Roadmap"** | Roadmap Tab | `generateRoadmapAction` | Synthesizes milestone delivery schedule; updates status to `EXPORTED` | Red diagnostic error banner |
| **"Generate Specification"** | Documents Tab | `generateDocumentAction` | Creates/updates Markdown document record in `Document` table | Red diagnostic error banner |
| **"Accept Proposal"** | Chat Drawer Proposal Card | `acceptProposalAction` | Mutates project field and creates ADR record | Error message on card |
| **"Send Message"** | Chat Drawer | `sendChatMessageAction` | Grounded AI response + optional proposal JSON | Inline error message in chat |

### 69–74. Development, Deployment, Testing & Git Workflow
`Status: IMPLEMENTED`  
- **Local Dev Setup**: `npm run dev` (starts Next.js dev server on `http://localhost:3000`).
- **Testing**: `npm test` (`npx vitest run`).
- **Type Checking**: `npm run typecheck` (`tsc --noEmit`).
- **Linting**: `npm run lint` (`eslint`).
- **Build**: `npm run build` (`next build`).
- **Deployment**: Automatic Vercel deployment on `git push origin main`.
