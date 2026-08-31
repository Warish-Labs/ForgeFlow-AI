import { DocumentType } from "@/lib/actions/document";

export interface DocumentPromptContext {
  projectName: string;
  ideaText: string;
  problemStatement?: string | null;
  techStack: string[];
  requirements: { functional?: string[]; nonFunctional?: string[] };
  features: { title: string; description?: string | null; phase: string; status: string }[];
  decisions: { decision: string; reasoning: string; alternative?: string | null; affectedAreas: string[] }[];
  roadmapItems: { title: string; phase: string; status: string; dependsOn: string[] }[];
  architecture?: {
    overview?: string;
    components?: { name: string; type: string; description: string; tech: string }[];
    dataModels?: { entity: string; description: string; fields: string[] }[];
  } | null;
}

export function buildDocumentSystemPrompt(docType: DocumentType, ctx: DocumentPromptContext): string {
  const stackStr = ctx.techStack.length > 0 ? ctx.techStack.join(", ") : "Not specified yet";
  const reqStr = JSON.stringify(ctx.requirements);
  const featuresStr = ctx.features.map((f) => `- [${f.phase}] ${f.title}: ${f.description || ""}`).join("\n");
  const adrStr = ctx.decisions.map((d) => `- ${d.decision} (Reasoning: ${d.reasoning})`).join("\n");
  const roadmapStr = ctx.roadmapItems.map((r) => `- [${r.phase}] ${r.title} (Depends on: ${r.dependsOn.join(", ") || "None"})`).join("\n");
  const archOverview = ctx.architecture?.overview || "Architecture topology pending synthesis.";

  return `You are a Principal Technical Writer and Lead Systems Architect.
Your task is to write an exhaustive, highly structured, production-grade technical specification document in GitHub Flavored Markdown for the project "${ctx.projectName}".

DOCUMENT TYPE REQUESTED: ${docType}

=== LIVE PROJECT STATE GROUNDING ===
- Project Name: ${ctx.projectName}
- Executive Vision: ${ctx.ideaText}
- Problem Statement: ${ctx.problemStatement || "N/A"}
- Tech Stack: ${stackStr}
- Requirements: ${reqStr}
- Features Backlog:
${featuresStr || "No features extracted yet."}
- System Architecture Overview: ${archOverview}
- Architecture Decision Log (ADRs):
${adrStr || "No ADRs recorded yet."}
- Delivery Roadmap:
${roadmapStr || "No roadmap scheduled yet."}

WRITING & FORMATTING RULES:
1. ALWAYS write out full, complete, in-depth Markdown content specifically grounded in the live project state above. Never output hardcoded generic template text or brief summaries.
2. Structure the document logically using markdown headers (\`# Title\`, \`## Section\`, \`### Subsection\`), bullet points, tables, code blocks, and alerts (\`> [!NOTE]\`, \`> [!IMPORTANT]\`, \`> [!TIP]\`).
3. Tailor the tone and emphasis to the requested document type:
   - PRD / REQUIREMENTS: Focus on user problems, functional/non-functional requirements, acceptance criteria, and edge cases.
   - FEATURES: Detailed user stories, phase breakdown (MVP, Phase 2, Phase 3), and priority rankings.
   - STACK: Dependency guide, framework trade-offs, configuration notes, and rationale for each choice.
   - ARCHITECTURE / ADRS: System topology, component roles, data flow, entity relationships, and decision records.
   - DATABASE: Entity schemas, field types, constraints, indexing strategies, and single-tenant isolation.
   - SECURITY: Threat model, Clerk authentication, single-tenant ownerId guards, input sanitization, and Zod output guards.
   - ROADMAP: Milestone sequencing, dependency chain ordering, risk mitigation, and estimated delivery timeline.
   - BLUEPRINT: Full unified master specification covering all aspects from vision to deployment.
4. Output ONLY the raw Markdown text of the document. Do NOT wrap the entire response in markdown code blocks like \`\`\`markdown ... \`\`\`.`;
}
