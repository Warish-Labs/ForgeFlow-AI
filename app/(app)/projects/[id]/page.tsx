import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectByIdAction } from "@/lib/actions/project";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  SparklesIcon,
  LayersIcon,
  DatabaseIcon,
  FileTextIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";

interface ProjectOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
  const { id } = await params;
  const project = await getProjectByIdAction(id);

  if (!project) {
    notFound();
  }

  const featureCount = project._count?.features ?? 0;
  const decisionCount = project._count?.decisions ?? 0;
  const roadmapCount = project._count?.roadmapItems ?? 0;
  const documentCount = project._count?.documents ?? 0;

  return (
    <div className="space-y-8">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="bg-[var(--navy-800)]/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Features</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{featureCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-[var(--accent-cyan)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--navy-800)]/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Decisions</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{decisionCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center">
              <LayersIcon className="h-5 w-5 text-[var(--accent-blue)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--navy-800)]/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Roadmap Phases</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{roadmapCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[var(--navy-700)] border border-[var(--border-subtle)] flex items-center justify-center">
              <DatabaseIcon className="h-5 w-5 text-[var(--accent-muted)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--navy-800)]/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Docs Generated</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{documentCount}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[var(--navy-700)] border border-[var(--border-subtle)] flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[var(--text-primary)]">
                Software Vision & Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {project.ideaText}
              </p>
              {project.problemStatement && (
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Problem Statement
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {project.problemStatement}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Decisions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[var(--text-primary)]">
                Architectural Decisions
              </CardTitle>
              <Link
                href={`/projects/${project.id}/architecture`}
                className="text-xs text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] font-medium inline-flex items-center gap-1"
              >
                View all <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.decisions.length > 0 ? (
                project.decisions.slice(0, 3).map((dec) => (
                  <div
                    key={dec.id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/40 p-3.5"
                  >
                    <span className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      {dec.decision}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {dec.reasoning}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic py-2">
                  No architectural decisions recorded yet. Phase 3 AI synthesis will generate initial decisions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[var(--text-primary)]">
                Planned Features
              </CardTitle>
              <Link
                href={`/projects/${project.id}/features`}
                className="text-xs text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] font-medium inline-flex items-center gap-1"
              >
                View all <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.features.length > 0 ? (
                project.features.slice(0, 4).map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/30 p-3 text-xs"
                  >
                    {feat.status === "completed" ? (
                      <CheckCircle2Icon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ClockIcon className="h-4 w-4 text-[var(--accent-muted)] shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <p className="font-medium text-[var(--text-primary)]">{feat.title}</p>
                      {feat.description && (
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                          {feat.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic py-2">
                  No features added yet. Use the Features tab or run AI Requirements Analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
