"use client";

import { useState } from "react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { TechBadge } from "@/components/stack/TechBadge";
import { ProjectStatus } from "@prisma/client";
import {
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  ArrowRightIcon,
  CircleDotIcon,
  PackageCheckIcon,
  LayoutDashboardIcon,
} from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  ideaText: string;
  status: ProjectStatus;
  techStack: unknown;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    features: number;
    decisions: number;
    roadmapItems: number;
    documents: number;
  };
}

interface DashboardClientProps {
  initialProjects: ProjectItem[];
}

const statusMap: Record<
  ProjectStatus,
  { label: string; pillClass: string; isGreen: boolean }
> = {
  PLANNING: { label: "Planning", pillClass: "border-[#1060ee] text-[#38b6ff] bg-[#1060ee]/10", isGreen: false },
  ARCHITECTURE: { label: "Architecture", pillClass: "border-[#1060ee] text-[#38b6ff] bg-[#1060ee]/10", isGreen: false },
  ROADMAP_READY: { label: "Roadmap Ready", pillClass: "border-[#2fe6b0]/40 text-[#2fe6b0] bg-[#2fe6b0]/10", isGreen: true },
  EXPORTED: { label: "Exported", pillClass: "border-[#2fe6b0]/40 text-[#2fe6b0] bg-[#2fe6b0]/10", isGreen: true },
};

function formatRelativeTime(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function DashboardClient({ initialProjects }: DashboardClientProps) {
  const [projects] = useState<ProjectItem[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ideaText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] space-y-8 pb-16">
      {/* Top Workspace Banner */}
      <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill-tag uppercase">FORGEFLOW PLATFORM</span>
              <HelpTooltip
                title="ForgeFlow Project Workspaces"
                text="Central portfolio of software blueprints. Click any workspace to edit stack, synthesize ADR records, or chat with Anvil AI Agent."
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#f3f6fc] mt-2">
              Architectural Project Workspaces
            </h1>
            <p className="text-xs text-[#9aa4b8] mt-1 max-w-xl">
              Persistent project state management. Transform ideas into production specs.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#1060ee] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shrink-0 shadow-lg shadow-blue-500/20"
          >
            <PlusIcon className="h-4 w-4" />
            New Architecture Blueprint
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#1b2338]">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c6980]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, vision, or tech stack..."
              className="w-full rounded border border-[#1b2338] bg-[#070a14] pl-9 pr-3 py-1.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "PLANNING", "ARCHITECTURE", "ROADMAP_READY", "EXPORTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3 py-1 text-[10px] font-mono transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "border border-[#1060ee] bg-[#1060ee] text-white font-bold shadow-sm"
                    : "border border-[#1b2338] bg-[#070a14] text-[#9aa4b8] hover:border-[#38b6ff]"
                }`}
              >
                {st === "ALL" ? "All Blueprints" : statusMap[st as ProjectStatus]?.label || st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Column Company Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const statusInfo = statusMap[project.status] || statusMap.PLANNING;
            const stackList: string[] = Array.isArray(project.techStack)
              ? (project.techStack as string[])
              : [];

            // Calculate 4-step progress index
            let currentStepIdx = 0;
            if (project.status === "PLANNING") currentStepIdx = 0;
            else if (project.status === "ARCHITECTURE") currentStepIdx = 1;
            else if (project.status === "ROADMAP_READY") currentStepIdx = 2;
            else if (project.status === "EXPORTED") currentStepIdx = 3;

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 transition-all hover:border-[#1060ee] hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="space-y-3">
                  {/* Top Bar: Title & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#f3f6fc] group-hover:text-[#38b6ff] transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold shrink-0 ${statusInfo.pillClass}`}>
                      {statusInfo.isGreen ? (
                        <PackageCheckIcon className="h-3 w-3 text-[#2fe6b0]" />
                      ) : (
                        <CircleDotIcon className="h-3 w-3 text-[#38b6ff]" />
                      )}
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Relative Timestamp */}
                  <div className="text-[10px] font-mono text-[#5c6980]">
                    Updated {formatRelativeTime(project.updatedAt)}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#9aa4b8] line-clamp-3 leading-relaxed">
                    {project.ideaText}
                  </p>

                  {/* Tech Stack Badges */}
                  {stackList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stackList.slice(0, 4).map((tech) => (
                        <TechBadge key={tech} name={tech} interactive={false} />
                      ))}
                      {stackList.length > 4 && (
                        <span className="rounded-full border border-[#1b2338] bg-[#070a14] px-2 py-0.5 text-[10px] font-mono text-[#5c6980]">
                          +{stackList.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 4-Step Progress Bar Indicator */}
                <div className="mt-4 pt-3 border-t border-[#1b2338] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5c6980]">
                    <span>Planning</span>
                    <span>Arch</span>
                    <span>Roadmap</span>
                    <span>Export</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                    {[0, 1, 2, 3].map((stepIdx) => (
                      <div
                        key={stepIdx}
                        className={`h-full rounded-full transition-all ${
                          stepIdx <= currentStepIdx
                            ? statusInfo.isGreen && stepIdx === 3
                              ? "bg-[#2fe6b0]"
                              : "bg-[#1060ee]"
                            : "bg-[#1b2338]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="mt-4 pt-3 border-t border-[#1b2338]">
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-[#1060ee]/40 bg-[#131a2c] py-2 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
                  >
                    Open Workspace <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1b2338] bg-[#0d1220] py-20 text-center space-y-3">
          <div className="h-12 w-12 rounded border border-[#1060ee]/40 bg-[#131a2c] flex items-center justify-center text-[#38b6ff]">
            <SparklesIcon className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#f3f6fc]">No Architecture Blueprints Found</h3>
          <p className="text-xs text-[#5c6980] max-w-sm">
            {searchQuery || statusFilter !== "ALL"
              ? "No project matching your search query or filter."
              : "You haven't created any software blueprints yet. Click below to create your first architecture project."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded bg-[#1060ee] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all mt-2"
          >
            <PlusIcon className="h-4 w-4" /> Create New Blueprint
          </button>
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
