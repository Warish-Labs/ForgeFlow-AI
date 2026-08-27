"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { deleteProjectAction } from "@/lib/actions/project";
import { AnalyzeProjectButton } from "@/components/ai/AnalyzeProjectButton";
import { ProjectChatDrawer } from "@/components/ai/ProjectChatDrawer";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { ProjectStatus } from "@prisma/client";
import {
  ArrowLeftIcon,
  Trash2Icon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SparklesIcon,
  LayersIcon,
  DatabaseIcon,
  FileTextIcon,
  BotIcon,
} from "lucide-react";

interface WorkspaceHeaderProps {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    techStack: unknown;
  };
}

const statusMap: Record<
  ProjectStatus,
  { variant: "draft" | "in_progress" | "completed" | "archived"; label: string }
> = {
  PLANNING: { variant: "draft", label: "Planning" },
  ARCHITECTURE: { variant: "in_progress", label: "Architecture" },
  ROADMAP_READY: { variant: "in_progress", label: "Roadmap Ready" },
  EXPORTED: { variant: "completed", label: "Exported" },
};

export function ProjectWorkspaceHeader({ project }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const statusInfo = statusMap[project.status] ?? statusMap.PLANNING;
  const stackList: string[] = Array.isArray(project.techStack)
    ? (project.techStack as string[])
    : [];

  const tabs = [
    {
      href: `/projects/${project.id}`,
      label: "Overview",
      icon: LayoutDashboardIcon,
      exact: true,
      tooltipTitle: "Overview Tab",
      tooltipText: "WHAT: Project dashboard showing completeness score, software vision, tech stack manager, confirmed assumptions, and next step advice.",
    },
    {
      href: `/projects/${project.id}/requirements`,
      label: "Requirements",
      icon: ScrollTextIcon,
      tooltipTitle: "Requirements Tab",
      tooltipText: "WHAT: Functional & non-functional system constraints extracted from your vision by AI synthesis. WHEN: Review specifications before architecture.",
    },
    {
      href: `/projects/${project.id}/features`,
      label: "Features",
      icon: SparklesIcon,
      tooltipTitle: "Features Backlog Tab",
      tooltipText: "WHAT: Prioritized feature inventory categorized by MVP, Phase 2, and Phase 3 release milestones.",
    },
    {
      href: `/projects/${project.id}/architecture`,
      label: "Architecture",
      icon: LayersIcon,
      tooltipTitle: "Architecture & ADR Tab",
      tooltipText: "WHAT: System topology diagrams, entity data models, and Architecture Decision Records (ADRs) with rationale and trade-offs.",
    },
    {
      href: `/projects/${project.id}/roadmap`,
      label: "Roadmap",
      icon: DatabaseIcon,
      tooltipTitle: "Roadmap Tab",
      tooltipText: "WHAT: Sequential milestone timeline with prerequisite task dependency links for build execution.",
    },
    {
      href: `/projects/${project.id}/documents`,
      label: "Documents",
      icon: FileTextIcon,
      tooltipTitle: "Document Specs Tab",
      tooltipText: "WHAT: Multi-document manager to generate, edit, version-track, and export 10 PRD and technical Markdown specifications.",
    },
  ];

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteProjectAction(project.id);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setIsDeleting(false);
      alert(result.error.message);
    }
  }

  return (
    <>
      <header className="border-b border-[var(--border-subtle)] bg-[var(--navy-900)]/90 px-4 pt-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)] text-[var(--text-muted)] transition-colors hover:bg-[var(--navy-700)] hover:text-[var(--text-primary)]"
                title="Back to Dashboard"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">
                    {project.name}
                  </h1>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  <HelpTooltip
                    title="Project Status Lifecycle"
                    text="Planning: Vision created. Architecture: Component topology & ADRs modeled. Roadmap Ready: Implementation order ready. Exported: Blueprint downloaded."
                  />
                </div>

                {stackList.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {stackList.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-[var(--navy-800)] px-2 py-0.5 text-[10px] font-mono text-[var(--accent-muted)] border border-[var(--border-subtle)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <AnalyzeProjectButton projectId={project.id} variant="accent" size="sm" showTooltip={true} />

              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-accent)] bg-[var(--navy-800)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--navy-700)] hover:text-[var(--accent-cyan)] transition-colors"
                  title="Open AI Architecture Copilot Chat"
                >
                  <BotIcon className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                  AI Copilot
                </button>
                <HelpTooltip
                  title="AI Copilot Assistant"
                  text="WHAT: Interactive architecture copilot trained on this project's exact state. WHEN: Ask technical questions, evaluate trade-offs, or clarify design choices."
                  side="bottom"
                />
              </div>

              <div className="inline-flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
                  title="Delete this project blueprint permanently"
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-[var(--border-subtle)]/60 pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);

              return (
                <div key={tab.href} className="inline-flex items-center gap-1">
                  <Link
                    href={tab.href}
                    className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-[var(--accent-blue)] text-[var(--accent-cyan)] bg-[var(--navy-800)]/40 rounded-t"
                        : "border-transparent text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Link>
                  <HelpTooltip
                    title={tab.tooltipTitle}
                    text={tab.tooltipText}
                    side="bottom"
                  />
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Chat Drawer */}
      <ProjectChatDrawer
        projectId={project.id}
        projectName={project.name}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
