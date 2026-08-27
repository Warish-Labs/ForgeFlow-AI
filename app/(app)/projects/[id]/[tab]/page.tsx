import { notFound } from "next/navigation";
import { getProjectByIdAction } from "@/lib/actions/project";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyzeProjectButton } from "@/components/ai/AnalyzeProjectButton";
import { GenerateArchitectureButton } from "@/components/architecture/GenerateArchitectureButton";
import { DecisionCard } from "@/components/architecture/DecisionCard";
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
  { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }
> = {
  requirements: {
    title: "Project Requirements & Scope",
    desc: "Structured functional, technical, and non-functional requirements extracted from software vision.",
    icon: ScrollTextIcon,
  },
  features: {
    title: "Feature Backlog & User Stories",
    desc: "Prioritized feature definitions mapped by complexity, priority, and implementation status.",
    icon: SparklesIcon,
  },
  architecture: {
    title: "System Architecture & Decision Log (ADR)",
    desc: "Component topology diagrams, entity data models, and immutable technical decision rationale.",
    icon: LayersIcon,
  },
  roadmap: {
    title: "Implementation Roadmap & Milestones",
    desc: "Sequential delivery phases, dependencies, and milestone target dates.",
    icon: DatabaseIcon,
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{meta.title}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tab === "architecture" ? (
            <GenerateArchitectureButton projectId={project.id} variant="accent" size="sm" />
          ) : (
            <AnalyzeProjectButton projectId={project.id} variant="accent" size="sm" />
          )}
        </div>
      </div>

      {/* Architecture Tab View */}
      {tab === "architecture" && (
        <div className="space-y-6">
          {/* Overview */}
          {archObj.overview && (
            <Card className="bg-[var(--navy-800)]/80 border-[var(--border-accent)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-2">
                  <ServerIcon className="h-4 w-4" /> System Topology Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {archObj.overview}
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Components Breakdown */}
          {archComponents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <ServerIcon className="h-4 w-4 text-[var(--accent-blue)]" /> Core System Components
              </h3>
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

          {/* Entity Data Models */}
          {archModels.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <DatabaseZapIcon className="h-4 w-4 text-[var(--accent-cyan)]" /> Entity Data Models
              </h3>
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

          {/* Architecture Decision Records (ADRs) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <LayersIcon className="h-4 w-4 text-[var(--accent-blue)]" /> Architecture Decision Records (ADRs)
            </h3>
            {project.decisions.length > 0 ? (
              <div className="space-y-4">
                {project.decisions.map((dec) => (
                  <DecisionCard
                    key={dec.id}
                    decision={dec.decision}
                    reasoning={dec.reasoning}
                    alternative={dec.alternative}
                    affectedAreas={dec.affectedAreas}
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
          {project.problemStatement && (
            <Card className="border-[var(--border-accent)] bg-[var(--navy-800)]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-2">
                  <ZapIcon className="h-4 w-4" /> Core Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {project.problemStatement}
                </p>
              </CardContent>
            </Card>
          )}

          {stackList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <CpuIcon className="h-4 w-4 text-[var(--accent-blue)]" /> Recommended Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stackList.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-[var(--border-accent)] bg-[var(--navy-700)] px-3 py-1.5 text-xs font-mono text-[var(--accent-cyan)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {functionalReqs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <CheckCircle2Icon className="h-4 w-4 text-emerald-400" /> Functional Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {functionalReqs.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/40 p-3 text-xs text-[var(--text-secondary)]">
                      <span className="font-mono text-[var(--accent-cyan)] font-bold shrink-0">F{idx + 1}.</span>
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-[var(--accent-cyan)]" /> Non-Functional Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {nonFunctionalReqs.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/40 p-3 text-xs text-[var(--text-secondary)]">
                      <span className="font-mono text-[var(--accent-blue)] font-bold shrink-0">NFR{idx + 1}.</span>
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyTabPlaceholder
              title="No Requirements Synthesized Yet"
              desc="Click 'Analyze Vision' above to run the LangGraph AI requirement synthesis agent."
            />
          )}
        </div>
      )}

      {/* Features Tab */}
      {tab === "features" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.features.length > 0 ? (
            project.features.map((feat) => (
              <Card key={feat.id} className="bg-[var(--navy-800)]/40">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
                    {feat.title}
                  </CardTitle>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--navy-700)] text-[var(--accent-muted)]">
                    {feat.phase}
                  </span>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {feat.description ?? "No description provided."}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyTabPlaceholder
              title="No features generated yet"
              desc="Run the AI Requirement Synthesis node in Phase 2 to extract features automatically."
            />
          )}
        </div>
      )}

      {/* Roadmap Tab */}
      {tab === "roadmap" && (
        <div className="space-y-4">
          {project.roadmapItems.length > 0 ? (
            project.roadmapItems.map((item) => (
              <Card key={item.id} className="bg-[var(--navy-800)]/40">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--accent-cyan)]">
                        {item.phase}
                      </span>
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  <Badge variant={item.status === "completed" ? "completed" : "in_progress"}>
                    {item.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyTabPlaceholder
              title="No roadmap items planned"
              desc="Phase 4 AI Roadmap Generator will structure sequential delivery milestones."
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
