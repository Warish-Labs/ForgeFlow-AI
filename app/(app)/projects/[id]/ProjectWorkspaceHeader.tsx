"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProjectAction } from "@/lib/actions/project";
import { AnalyzeProjectButton } from "@/components/ai/AnalyzeProjectButton";
import { ProjectChatDrawer } from "@/components/ai/ProjectChatDrawer";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { TechBadge } from "@/components/stack/TechBadge";
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
  { pillClass: string; label: string }
> = {
  PLANNING: { pillClass: "border-[#c8ad86] text-[#c8ad86]", label: "Planning" },
  ARCHITECTURE: { pillClass: "border-blue-400 text-blue-300", label: "Architecture" },
  ROADMAP_READY: { pillClass: "border-emerald-400 text-emerald-300", label: "Roadmap Ready" },
  EXPORTED: { pillClass: "border-purple-400 text-purple-300", label: "Exported" },
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
      tooltipText: "WHAT: Project dashboard showing completeness score, vision, tech stack manager, confirmed assumptions, and Tavily Live Search.",
    },
    {
      href: `/projects/${project.id}/requirements`,
      label: "Requirements",
      icon: ScrollTextIcon,
      tooltipTitle: "Requirements Tab",
      tooltipText: "WHAT: Functional & non-functional system constraints extracted from your vision by AI synthesis.",
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
      tooltipText: "WHAT: System topology diagrams, entity data models, and Architecture Decision Records (ADRs).",
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
      <header className="border-b border-[#fff7dd]/15 bg-[#000000] px-4 pt-4 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#fff7dd]/20 bg-[#0a0a0a] text-[#66635f] transition-colors hover:border-[#c8ad86] hover:text-[#fff7dd]"
                title="Back to Dashboard Workspaces"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-[#fff7dd]">
                    {project.name}
                  </h1>
                  <span className={`pill-tag uppercase ${statusInfo.pillClass}`}>
                    {statusInfo.label}
                  </span>
                  <HelpTooltip
                    title="Project Status Lifecycle"
                    text="Planning: Vision created. Architecture: Component topology & ADRs modeled. Roadmap Ready: Implementation order ready. Exported: Blueprint downloaded."
                  />
                </div>

                {stackList.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {stackList.slice(0, 5).map((tech) => (
                      <TechBadge key={tech} name={tech} interactive={false} />
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
                  className="inline-flex items-center gap-1.5 rounded border border-[#c8ad86] bg-[#0a0a0a] px-3.5 py-1.5 text-xs font-semibold text-[#c8ad86] hover:bg-[#c8ad86] hover:text-[#000000] transition-all"
                  title="Open AI Architecture Copilot Chat"
                >
                  <BotIcon className="h-3.5 w-3.5" />
                  AI Copilot
                </button>
                <HelpTooltip
                  title="AI Copilot Assistant"
                  text="WHAT: Interactive architecture copilot trained on this project's exact state with Tavily live search capabilities."
                  side="bottom"
                />
              </div>

              <div className="inline-flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
                  title="Delete this project blueprint permanently"
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex gap-1 overflow-x-auto border-t border-[#fff7dd]/15 pt-2">
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
                        ? "border-[#c8ad86] text-[#c8ad86] bg-[#0a0a0a] rounded-t"
                        : "border-transparent text-[#66635f] hover:border-[#fff7dd]/20 hover:text-[#fff7dd]"
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
