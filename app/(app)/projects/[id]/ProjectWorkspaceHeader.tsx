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
  CompassIcon,
  ListChecksIcon,
  NetworkIcon,
  MapIcon,
  ScrollTextIcon,
  FileTextIcon,
  HammerIcon,
  CircleDotIcon,
  PackageCheckIcon,
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
  { pillClass: string; label: string; isGreen: boolean }
> = {
  PLANNING: { pillClass: "border-[#1060ee] text-[#38b6ff] bg-[#1060ee]/10", label: "Planning", isGreen: false },
  ARCHITECTURE: { pillClass: "border-[#1060ee] text-[#38b6ff] bg-[#1060ee]/10", label: "Architecture", isGreen: false },
  ROADMAP_READY: { pillClass: "border-[#2fe6b0]/40 text-[#2fe6b0] bg-[#2fe6b0]/10", label: "Roadmap Ready", isGreen: true },
  EXPORTED: { pillClass: "border-[#2fe6b0]/40 text-[#2fe6b0] bg-[#2fe6b0]/10", label: "Exported", isGreen: true },
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
      icon: CompassIcon,
      exact: true,
      tooltipTitle: "Overview Tab",
      tooltipText: "WHAT: Project overview showing completeness score, vision, tech stack manager, and Tavily Live Search.",
    },
    {
      href: `/projects/${project.id}/requirements`,
      label: "Requirements",
      icon: ListChecksIcon,
      tooltipTitle: "Requirements Tab",
      tooltipText: "WHAT: Functional & non-functional system constraints extracted from your vision by AI synthesis.",
    },
    {
      href: `/projects/${project.id}/architecture`,
      label: "Architecture",
      icon: NetworkIcon,
      tooltipTitle: "Architecture & ADR Tab",
      tooltipText: "WHAT: System topology diagrams, entity data models, and Architecture Decision Records (ADRs).",
    },
    {
      href: `/projects/${project.id}/roadmap`,
      label: "Roadmap",
      icon: MapIcon,
      tooltipTitle: "Roadmap Tab",
      tooltipText: "WHAT: Sequential milestone timeline with prerequisite task dependency links for build execution.",
    },
    {
      href: `/projects/${project.id}/documents`,
      label: "Documents",
      icon: FileTextIcon,
      tooltipTitle: "Document Specs Tab",
      tooltipText: "WHAT: Multi-document manager to generate, edit, version-track, and export PRD and technical Markdown specifications.",
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
      <header className="border-b border-[#1b2338] bg-[#070a14] px-4 pt-4 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#1b2338] bg-[#0d1220] text-[#5c6980] transition-colors hover:border-[#38b6ff] hover:text-[#f3f6fc]"
                title="Back to Dashboard Workspaces"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-[#f3f6fc]">
                    {project.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${statusInfo.pillClass}`}>
                    {statusInfo.isGreen ? (
                      <PackageCheckIcon className="h-3 w-3 text-[#2fe6b0]" />
                    ) : (
                      <CircleDotIcon className="h-3 w-3 text-[#38b6ff]" />
                    )}
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
                  className="inline-flex items-center gap-1.5 rounded border border-[#1060ee] bg-[#0d1220] px-3.5 py-1.5 text-xs font-semibold text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all shadow-sm"
                  title="Open Anvil AI Agent Chat Drawer"
                >
                  <HammerIcon className="h-3.5 w-3.5" />
                  Ask Anvil
                </button>
                <HelpTooltip
                  title="Anvil AI Agent"
                  text="WHAT: Interactive architecture agent trained on this project's exact state with Proposal Cards and Accept/Reject workflow."
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
          <nav className="flex gap-1 overflow-visible border-t border-[#1b2338] pt-2 flex-wrap sm:flex-nowrap">
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
                        ? "border-[#38b6ff] text-[#38b6ff] bg-[#0d1220] rounded-t font-semibold"
                        : "border-transparent text-[#9aa4b8] hover:border-[#1060ee]/30 hover:text-[#f3f6fc]"
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

      {/* Anvil Chat Drawer */}
      <ProjectChatDrawer
        projectId={project.id}
        projectName={project.name}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
