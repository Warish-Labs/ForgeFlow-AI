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
  { label: string; pillClass: string }
> = {
  PLANNING: { label: "Planning", pillClass: "border-[#3b82f6] text-[#60a5fa]" },
  ARCHITECTURE: { label: "Architecture", pillClass: "border-sky-400 text-sky-300" },
  ROADMAP_READY: { label: "Roadmap Ready", pillClass: "border-emerald-400 text-emerald-300" },
  EXPORTED: { label: "Exported", pillClass: "border-indigo-400 text-indigo-300" },
};

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
    <div className="min-h-screen bg-[#000000] text-[#f8fafc] space-y-8 pb-16">
      {/* Top Workspace Banner */}
      <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill-tag uppercase">FORGEFLOW PLATFORM</span>
              <HelpTooltip
                title="ForgeFlow AI Lifecycle"
                text="Create software vision -> Run AI Requirement synthesis -> Build System Architecture ADRs -> Generate Implementation Roadmap -> Export 10 Markdown Documents."
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-normal tracking-[-1px] text-[#f8fafc] mt-2">
              Architectural Project Workspaces
            </h1>
            <p className="text-xs text-[#cbd5e1] mt-1 max-w-xl">
              Central portfolio of software blueprints. Click any workspace to edit stack, synthesize ADR records, or chat with AI Copilot.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#2563eb] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-all shrink-0 shadow-lg shadow-blue-500/20"
          >
            <PlusIcon className="h-4 w-4" />
            New Architecture Blueprint
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#3b82f6]/20">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, idea vision, or tech stack..."
              className="w-full rounded border border-[#3b82f6]/30 bg-[#0b1120] pl-9 pr-3 py-1.5 text-xs text-[#f8fafc] placeholder-[#64748b] focus:border-[#38bdf8] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "PLANNING", "ARCHITECTURE", "ROADMAP_READY", "EXPORTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3 py-1 text-[10px] font-mono transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "border border-[#3b82f6] bg-[#2563eb] text-white font-bold shadow-sm"
                    : "border border-[#3b82f6]/20 bg-[#0b1120] text-[#cbd5e1] hover:border-[#38bdf8]"
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

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded border border-[#3b82f6]/20 bg-[#050814] p-6 transition-all hover:border-[#3b82f6] hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="space-y-3">
                  {/* Top Bar: Title & Category Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <span className={`pill-tag uppercase ${statusInfo.pillClass} shrink-0`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#cbd5e1] line-clamp-3 leading-relaxed">
                    {project.ideaText}
                  </p>

                  {/* Tech Stack Logo Badges */}
                  {stackList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stackList.slice(0, 4).map((tech) => (
                        <TechBadge key={tech} name={tech} interactive={false} />
                      ))}
                      {stackList.length > 4 && (
                        <span className="rounded-full border border-[#3b82f6]/20 bg-[#0b1120] px-2 py-0.5 text-[10px] font-mono text-[#64748b]">
                          +{stackList.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Grid Stats & Open Link */}
                <div className="mt-6 pt-4 border-t border-[#3b82f6]/20 space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-[#cbd5e1]">
                    <div className="rounded bg-[#0b1120] p-1.5 border border-[#3b82f6]/15">
                      <span className="block font-bold text-[#38bdf8]">{project._count.features}</span>
                      <span>Features</span>
                    </div>
                    <div className="rounded bg-[#0b1120] p-1.5 border border-[#3b82f6]/15">
                      <span className="block font-bold text-[#38bdf8]">{project._count.decisions}</span>
                      <span>ADRs</span>
                    </div>
                    <div className="rounded bg-[#0b1120] p-1.5 border border-[#3b82f6]/15">
                      <span className="block font-bold text-[#38bdf8]">{project._count.roadmapItems}</span>
                      <span>Roadmap</span>
                    </div>
                    <div className="rounded bg-[#0b1120] p-1.5 border border-[#3b82f6]/15">
                      <span className="block font-bold text-[#38bdf8]">{project._count.documents}</span>
                      <span>Docs</span>
                    </div>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-[#3b82f6]/40 bg-[#0b1120] py-2 text-xs font-medium text-[#38bdf8] hover:bg-[#2563eb] hover:text-white transition-all"
                  >
                    Open Workspace <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#3b82f6]/30 bg-[#0b1120] py-20 text-center space-y-3">
          <div className="h-12 w-12 rounded border border-[#3b82f6]/40 bg-[#151f32] flex items-center justify-center text-[#38bdf8]">
            <SparklesIcon className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#f8fafc]">No Architecture Blueprints Found</h3>
          <p className="text-xs text-[#64748b] max-w-sm">
            {searchQuery || statusFilter !== "ALL"
              ? "No project matching your search query or filter. Clear filter or try another search."
              : "You haven't created any software blueprints yet. Click below to create your first architecture project."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-all mt-2"
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
