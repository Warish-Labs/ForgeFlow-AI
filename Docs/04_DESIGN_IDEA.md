# ForgeFlow AI — Design Idea Doc

Companion UI/UX reference. Antigravity should treat this as intent, not pixel spec — use shadcn/ui primitives and Tailwind tokens to realize it, don't hand-roll components that shadcn already provides well.

---

## 1. Design Feel

ForgeFlow is a **planning tool that respects the user's judgment**, not a magic-box generator. The UI should feel like a technical workspace (think: Linear, Notion's structured databases, a well-built internal tool) — not a flashy "AI generates everything for you" marketing product. Every AI output should visually read as a *proposal you can push back on*, never as a final decree.

**Visual language:**
- Calm, structured, information-dense but not cluttered — this is a tool used by developers/students planning real work, not a consumer app.
- Neutral base palette (slate/zinc grays) with a single accent color for AI-generated/interactive elements, so the user's eye can immediately tell "this came from AI, this is my own input."
- Monospace accents (small, for technical values — stack names, env var names, decision IDs) mixed with a clean sans body font. Fits the technical-document nature of the product.
- Generous whitespace on structured data (requirement cards, decision log) — this is reference material people will re-read, not a chat feed to scroll past once.

## 2. Information Architecture

```
ForgeFlow
├── Landing (public, SEO'd)
├── Login / Register
└── App (authenticated, noindex)
    ├── Dashboard
    │     — project cards: name, status badge, last updated, progress
    │     — "New Project" primary CTA
    │
    └── Project Workspace  (persistent left tab rail)
          ├── Overview        — idea, problem statement, status, quick stats
          ├── Requirements    — structured requirement cards + clarifying-question prompts
          ├── Architecture    — text/ascii diagram + tech stack recommendation cards
          ├── Roadmap         — MVP / Phase 2 / Phase 3 kanban-style columns
          ├── Decisions       — chronological decision log, searchable
          ├── Documents       — export previews, download bundle
          ├── Chat            — persistent project-scoped AI conversation
          └── Settings        — rename, delete, AI usage meter
```

The tab rail is always visible inside a project — the user should never feel like they left "the project" to talk to the AI; Chat is a tab, not a separate modal universe.

## 3. Key Screens

### Dashboard
- Grid of project cards (shadcn `Card`). Each shows: name, one-line idea, status badge (`Planning` / `Architecture` / `Roadmap Ready` / `Exported`), relative "updated X ago" timestamp.
- Empty state (first-time user): centered illustration-free prompt — "Describe a software idea to get started" with the idea-text input right there, not buried behind a separate "create" click. Reduces friction for the core action.
- Loading state: skeleton cards (3–6), never a spinner.

### New Project — Quick vs Guided
- Single text field by default: "I want to build a platform for managing university events." with a subtle "Add more detail (optional)" disclosure that expands the guided fields (team size, timeline, preferred stack constraints) — never a mandatory multi-step form up front. Matches PRD §4's "don't force a huge form" principle.

### Overview Tab
- Idea + problem statement at top (editable inline).
- Status stepper showing where the project sits in Planning → Architecture → Roadmap → Exported.
- Quick stat row: # requirements, # decisions logged, roadmap items by phase, AI usage this session (ties to PRD §7.9 usage guardrail — this should be visible, not hidden in settings).

### Requirements Tab
- Requirement cards grouped by type (Users / Features / Constraints / Assumptions), each editable inline.
- If clarification is needed: a distinct "AI needs input" card at the top, visually different from confirmed requirements (different border/accent, not just a toast) — because this blocks progress and shouldn't be missable.

### Architecture Tab
- Text/ascii diagram rendered in a monospace block (TDD-style), with a plain-language narrative beside it — never diagram-only, since not everyone reads ascii diagrams fluently.
- Tech stack recommendation cards: one per category (Frontend/Backend/DB/Auth/Hosting), each showing **Choice → Reasoning (bulleted) → Alternative → When the alternative wins**. This directly implements PRD §7.3 — the "why" layer is a first-class UI element, not a tooltip.

### Roadmap Tab
- Three columns: MVP / Phase 2 / Phase 3 (kanban-style, shadcn primitives, drag optional — not required for MVP UI).
- Items show dependency chips when relevant.
- If AI pushed back on scope ("too large for stated timeline"), that reasoning is shown as a dismissible banner above the board, not buried in chat history.

### Decisions Tab
- Reverse-chronological log. Each entry: decision, reasoning, alternative considered, affected areas (as chips), date.
- Search/filter by affected area (e.g. filter to everything that touched "database").

### Chat Tab
- Standard streaming chat UI, but AI-proposed changes render as a distinct **Proposal Card** inline in the conversation (not just text) — showing the diff and an Impact summary, with explicit **Accept** / **Reject** buttons. This is the visual home of PRD §7.6's human-in-the-loop requirement — it must be impossible to miss that a change is pending.

### Documents Tab
- Tabs/accordion per document type (README / PRD / ARCHITECTURE / DATABASE / ROADMAP), rendered markdown preview, "Download bundle (.zip)" and "Copy Markdown" actions.

## 4. States (apply everywhere, per your own review checklist)

- **Loading:** skeleton screens matching the eventual content's shape — never a centered spinner as the primary loading state.
- **Empty:** always actionable (a CTA, never just "No data").
- **Error:** scoped to the panel that failed (error boundary per AI-touching component per TDD §12) — one failed generation should never take down the whole workspace.
- **AI usage limit reached:** a clear, specific inline message ("Daily AI limit reached — resets in X hours") at the point of action, not a generic failure toast.

## 5. Accessibility Notes

- All interactive elements keyboard-reachable and focus-visible (shadcn defaults handle most of this — don't override focus rings).
- Color is never the only signal (status badges get text + color; the "AI needs input" card gets an icon + label, not just a border color).
- Contrast: body text AA minimum against the neutral background palette.
- Streaming chat content uses `aria-live="polite"` so screen readers aren't flooded token-by-token.

## 6. Responsive / Mobile-First

- Dashboard and Overview/Documents/Decisions tabs are fully usable on mobile (single column, tab rail collapses to a bottom sheet or dropdown).
- Architecture ascii diagrams get horizontal scroll on narrow viewports rather than wrapping/breaking.
- Chat is the priority mobile experience after Dashboard — it's the most likely "quick check-in" surface.

## 7. What This Doc Is Not

This is not a pixel-perfect Figma replacement. Antigravity should use shadcn/ui components as-is wherever they fit (Card, Tabs, Badge, Skeleton, Dialog, Sheet) and reserve custom component work for the genuinely product-specific pieces: requirement cards, the tech-stack reasoning card, the roadmap board, and the chat proposal card.
