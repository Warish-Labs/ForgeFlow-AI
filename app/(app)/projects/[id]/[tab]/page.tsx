import { notFound } from "next/navigation";
import { getProjectByIdAction } from "@/lib/actions/project";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyzeProjectButton } from "@/components/ai/AnalyzeProjectButton";
import { GenerateArchitectureButton } from "@/components/architecture/GenerateArchitectureButton";
import { DecisionCard } from "@/components/architecture/DecisionCard";
import { GenerateRoadmapButton } from "@/components/roadmap/GenerateRoadmapButton";
import { ExportBlueprintButton } from "@/components/roadmap/ExportBlueprintButton";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { EditableRequirementsList } from "@/components/requirements/EditableRequirementsList";
import { EditableFeatureCard } from "@/components/features/EditableFeatureCard";
import { EditableDecisionCard } from "@/components/architecture/EditableDecisionCard";
import { EditableRoadmapCard } from "@/components/roadmap/EditableRoadmapCard";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import {
  ScrollTextIcon,
  SparklesIcon,
  LayersIcon,
  DatabaseIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  CpuIcon,
  ZapIcon,
  ServerIcon,
  DatabaseZapIcon,
} from "lucide-react";

interface ProjectTabParams {
  params: Promise<{ id: string; tab: string }>;
}

const validTabs = ["requirements", "features", "architecture", "roadmap"];

const tabMeta: Record<
  string,
  {
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltipTitle: string;
    tooltipText: string;
  }
> = {
  requirements: {
    title: "Project Requirements & Scope",
    desc: "Structured functional, technical, and non-functional requirements extracted from software vision.",
    icon: ScrollTextIcon,
    tooltipTitle: "Requirements & Scope",
    tooltipText: "WHAT: Functional goals (what system must do) and Non-Functional constraints (speed, security, reliability). WHEN TO USE: Verify specifications before architecture design.",
  },
  features: {
    title: "Feature Backlog & User Stories",
    desc: "Prioritized feature definitions mapped by complexity, priority, and implementation status.",
    icon: SparklesIcon,
    tooltipTitle: "Feature Backlog",
    tooltipText: "WHAT: Feature list categorized into MVP (Phase 1), Phase 2 (Growth), and Phase 3 (Scale). WHEN TO USE: Plan sprint deliverables and user scope.",
  },
  architecture: {
    title: "System Architecture & Decision Log (ADR)",
    desc: "Component topology diagrams, entity data models, and immutable technical decision rationale.",
    icon: LayersIcon,
    tooltipTitle: "System Architecture & ADRs",
    tooltipText: "WHAT: Component boundaries, entity relationships, and formal ADR records explaining technical trade-offs. WHEN TO USE: Guide engineering and technology selection.",
  },
  roadmap: {
    title: "Implementation Roadmap & Delivery Milestones",
    desc: "Sequential delivery phases (MVP, Phase 2, Phase 3), dependency tree links, and blueprint export.",
    icon: DatabaseIcon,
    tooltipTitle: "Implementation Roadmap",
    tooltipText: "WHAT: Ordered milestone release schedule with prerequisite task dependency tracking. WHEN TO USE: Track build execution order.",
  },
};

export default async function ProjectTabSubPage({ params }: ProjectTabParams) {
  const { id, tab } = await params;

  if (!validTabs.includes(tab)) {
    notFound();
  }

  const project = await getProjectByIdAction(id);
  if (!project) {
    notFound();
  }

  const meta = tabMeta[tab] ?? tabMeta.requirements;
  const Icon = meta.icon;

  const reqObj = (project.requirements as { functional?: string[]; nonFunctional?: string[] }) || {};
  const functionalReqs = reqObj.functional || [];
  const nonFunctionalReqs = reqObj.nonFunctional || [];
  const stackList = Array.isArray(project.techStack) ? (project.techStack as string[]) : [];

  const archObj = (project.architecture as {
    overview?: string;
    components?: { name: string; type: string; description: string; tech: string }[];
    dataModels?: { entity: string; description: string; fields: string[] }[];
  }) || {};

  const archComponents = archObj.components || [];
  const archModels = archObj.dataModels || [];

  return (
    <div className="space-y-6">
      {/* Subpage Header Banner */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--navy-800)]/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-[var(--accent-cyan)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{meta.title}</h2>
              <HelpTooltip title={meta.tooltipTitle} text={meta.tooltipText} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tab === "architecture" ? (
            <GenerateArchitectureButton projectId={project.id} variant="accent" size="sm" showTooltip={true} />
          ) : tab === "roadmap" ? (
            <>
              <GenerateRoadmapButton projectId={project.id} variant="accent" size="sm" showTooltip={true} />
              <ExportBlueprintButton projectId={project.id} variant="outline" size="sm" showTooltip={true} />
            </>
          ) : (
            <AnalyzeProjectButton projectId={project.id} variant="accent" size="sm" showTooltip={true} />
          )}
        </div>
      </div>

      {/* Roadmap Tab View */}
      {tab === "roadmap" && (
        <div className="space-y-6">
          {project.roadmapItems.length > 0 ? (
            <div className="space-y-3">
              <RoadmapTimeline items={project.roadmapItems} />
              <div className="pt-4 border-t border-[#1b2338]">
                <h4 className="text-xs font-mono font-bold uppercase text-[#38b6ff] mb-3">
                  Interactive Milestone Management
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.roadmapItems.map((item) => (
                    <EditableRoadmapCard
                      key={item.id}
                      projectId={project.id}
                      item={{
                        id: item.id,
                        title: item.title,
                        phase: item.phase,
                        status: item.status,
                        dependsOn: item.dependsOn,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyTabPlaceholder
              title="No Delivery Roadmap Generated Yet"
              desc="Click 'Generate Roadmap' above to synthesize sequential delivery milestones with prerequisite dependency tracking."
            />
          )}
        </div>
      )}

      {/* Architecture Tab View */}
      {tab === "architecture" && (
        <div className="space-y-6">
          {archObj.overview && (
            <Card className="bg-[var(--navy-800)]/80 border-[var(--border-accent)]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-2">
                  <ServerIcon className="h-4 w-4" /> System Topology Overview
                </CardTitle>
                <HelpTooltip
                  title="System Topology"
                  text="Overview of system tier arrangement (Frontend UI, API Gateway, Database Layer, LLM Providers)."
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {archObj.overview}
                </p>
              </CardContent>
            </Card>
          )}

          {archComponents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <ServerIcon className="h-4 w-4 text-[var(--accent-blue)]" /> Core System Components
                </h3>
                <HelpTooltip
                  title="Core System Components"
                  text="Modular services and architectural layers that compose the complete application stack."
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {archComponents.map((comp, idx) => (
                  <Card key={idx} className="bg-[var(--navy-800)]/40 border-[var(--border-subtle)]">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold text-[var(--text-primary)]">
                        {comp.name}
                      </CardTitle>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--navy-700)] text-[var(--accent-cyan)] border border-[var(--border-subtle)]">
                        {comp.type}
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2 text-xs">
                      <p className="text-[var(--text-muted)] leading-relaxed text-[11px]">
                        {comp.description}
                      </p>
                      <div className="pt-1 text-[10px] font-mono text-[var(--accent-muted)] border-t border-[var(--border-subtle)]">
                        Tech: {comp.tech}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {archModels.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <DatabaseZapIcon className="h-4 w-4 text-[var(--accent-cyan)]" /> Entity Data Models
                </h3>
                <HelpTooltip
                  title="Entity Data Models"
                  text="Database table entities, fields, and data types designed for relational integrity and single-tenant isolation."
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {archModels.map((model, idx) => (
                  <Card key={idx} className="bg-[var(--navy-800)]/40 border-[var(--border-subtle)]">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-bold text-[var(--text-primary)]">
                        {model.entity}
                      </CardTitle>
                      <p className="text-[11px] text-[var(--text-muted)]">{model.description}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
                        {model.fields.map((f) => (
                          <span
                            key={f}
                            className="rounded bg-[var(--navy-700)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <LayersIcon className="h-4 w-4 text-[var(--accent-blue)]" /> Architecture Decision Records (ADRs)
              </h3>
              <HelpTooltip
                title="Architecture Decision Records (ADRs)"
                text="Immutable records documenting critical architectural decisions, reasoning, trade-offs, and affected system areas."
              />
            </div>
            {project.decisions.length > 0 ? (
              <div className="space-y-4">
                {project.decisions.map((dec) => (
                  <EditableDecisionCard
                    key={dec.id}
                    projectId={project.id}
                    decision={{
                      id: dec.id,
                      decision: dec.decision,
                      reasoning: dec.reasoning,
                      alternative: dec.alternative,
                      affectedAreas: dec.affectedAreas,
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyTabPlaceholder
                title="No Architecture Decision Records (ADRs) Generated"
                desc="Click 'Generate Architecture' above to analyze technical trade-offs and build ADR records."
              />
            )}
          </div>
        </div>
      )}

      {/* Requirements Tab View */}
      {tab === "requirements" && (
        <div className="space-y-6">
          <EditableRequirementsList
            projectId={project.id}
            initialFunctional={functionalReqs}
            initialNonFunctional={nonFunctionalReqs}
          />
        </div>
      )}

      {/* Features Tab */}
      {tab === "features" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.features.length > 0 ? (
            project.features.map((feat) => (
              <EditableFeatureCard
                key={feat.id}
                projectId={project.id}
                feature={{
                  id: feat.id,
                  title: feat.title,
                  description: feat.description,
                  phase: feat.phase,
                  status: feat.status,
                }}
              />
            ))
          ) : (
            <EmptyTabPlaceholder
              title="No features generated yet"
              desc="Run the AI Requirement Synthesis node in Phase 2 to extract features automatically."
            />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyTabPlaceholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--navy-800)]/30 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--navy-800)] border border-[var(--border-subtle)]">
        <CpuIcon className="h-6 w-6 text-[var(--accent-cyan)] opacity-60" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}
