"use client";

import { useState, useEffect, useRef } from "react";
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
  FolderGit2Icon,
  LayersIcon,
  FileCheckIcon,
} from "lucide-react";

import { UsageDashboardCard } from "@/components/dashboard/UsageDashboardCard";
import { PremiumComingSoonModal } from "@/components/ui/PremiumComingSoonModal";
import { QuotaUsageResult } from "@/lib/services/quota";

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
  usage?: QuotaUsageResult;
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

export function DashboardClient({ initialProjects, usage }: DashboardClientProps) {
  const [projects] = useState<ProjectItem[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ideaText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate live portfolio stats across all user projects
  const totalProjects = projects.length;
  const activeArchitectures = projects.filter((p) => p.status === "ARCHITECTURE" || p.status === "ROADMAP_READY").length;
  const exportedBlueprints = projects.filter((p) => p.status === "EXPORTED").length;
  const totalFeaturesExtracted = projects.reduce((acc, p) => acc + (p._count?.features || 0), 0);
  const totalADRsLogged = projects.reduce((acc, p) => acc + (p._count?.decisions || 0), 0);

  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] pb-20">
      {/* Container with generous left/right padding */}
      <div className="max-w-[1350px] mx-auto px-6 md:px-12 pt-8 space-y-8">
        
        {/* Top Header Card */}
        <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-80 bg-[#1060ee]/15 blur-[90px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="pill-tag uppercase">FORGEFLOW PLATFORM WORKSPACE</span>
                <HelpTooltip
                  title="ForgeFlow Workspaces"
                  text="Central portfolio of software architecture blueprints. Each workspace retains a persistent state in PostgreSQL."
                />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#f3f6fc]">
                Software Architecture Portfolio
              </h1>
              <p className="text-xs md:text-sm text-[#9aa4b8] max-w-xl">
                Persistent project state management. Transform one-line software concepts into execution-ready engineering blueprints.
              </p>
            </div>

            <button
              onClick={() => {
                if (usage && usage.projectsCount >= usage.maxProjects) {
                  setIsPremiumModalOpen(true);
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1060ee] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shrink-0 shadow-lg shadow-blue-500/25 hover:scale-105"
            >
              <PlusIcon className="h-4 w-4" />
              New Architecture Blueprint
            </button>
          </div>

          {/* 4 Live Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#1b2338]">
            <div className="rounded-xl border border-[#1b2338] bg-[#131a2c] p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono font-medium">Total Blueprints</span>
                <FolderGit2Icon className="h-4 w-4 text-[#38b6ff]" />
              </div>
              <div className="text-xl font-bold text-[#f3f6fc]">{totalProjects}</div>
            </div>

            <div className="rounded-xl border border-[#1b2338] bg-[#131a2c] p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono font-medium">Active Architectures</span>
                <LayersIcon className="h-4 w-4 text-[#1060ee]" />
              </div>
              <div className="text-xl font-bold text-[#38b6ff]">{activeArchitectures}</div>
            </div>

            <div className="rounded-xl border border-[#1b2338] bg-[#131a2c] p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono font-medium">Exported Specs</span>
                <FileCheckIcon className="h-4 w-4 text-[#2fe6b0]" />
              </div>
              <div className="text-xl font-bold text-[#2fe6b0]">{exportedBlueprints}</div>
            </div>

            <div className="rounded-xl border border-[#1b2338] bg-[#131a2c] p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono font-medium">Features Extracted</span>
                <SparklesIcon className="h-4 w-4 text-[#38b6ff]" />
              </div>
              <div className="text-xl font-bold text-[#f3f6fc]">{totalFeaturesExtracted}</div>
            </div>
          </div>

          {/* Account AI Usage & Plan Limits Card */}
          {usage && <UsageDashboardCard usage={usage} />}

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6980]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search projects by title, prompt vision, or tech stack..."
                className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] pl-10 pr-4 py-2 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {["ALL", "PLANNING", "ARCHITECTURE", "ROADMAP_READY", "EXPORTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-full px-3.5 py-1 text-[11px] font-mono transition-all whitespace-nowrap ${
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

        {/* 3-Column Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const statusInfo = statusMap[project.status] || statusMap.PLANNING;
              const stackList: string[] = Array.isArray(project.techStack)
                ? (project.techStack as string[])
                : [];

              let currentStepIdx = 0;
              if (project.status === "PLANNING") currentStepIdx = 0;
              else if (project.status === "ARCHITECTURE") currentStepIdx = 1;
              else if (project.status === "ROADMAP_READY") currentStepIdx = 2;
              else if (project.status === "EXPORTED") currentStepIdx = 3;

              return (
                <div
                  key={project.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 transition-all hover:border-[#1060ee] hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Top Bar: Title & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-[#f3f6fc] group-hover:text-[#38b6ff] transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                        <div className="text-[10px] font-mono text-[#5c6980] mt-0.5">
                          Updated {formatRelativeTime(project.updatedAt)}
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold shrink-0 ${statusInfo.pillClass}`}>
                        {statusInfo.isGreen ? (
                          <PackageCheckIcon className="h-3 w-3 text-[#2fe6b0]" />
                        ) : (
                          <CircleDotIcon className="h-3 w-3 text-[#38b6ff]" />
                        )}
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Vision Prompt */}
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
                  <div className="mt-5 pt-3 border-t border-[#1b2338] space-y-1.5">
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
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#1060ee]/40 bg-[#131a2c] py-2.5 text-xs font-semibold text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all shadow-sm"
                    >
                      Open Workspace <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1b2338] bg-[#0d1220] py-20 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl border border-[#1060ee]/40 bg-[#131a2c] flex items-center justify-center text-[#38b6ff]">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#f3f6fc]">No Architecture Blueprints Found</h3>
            <p className="text-xs text-[#5c6980] max-w-sm">
              {searchQuery || statusFilter !== "ALL"
                ? "No project matching your search query or filter."
                : "You haven't created any software blueprints yet. Click below to create your first blueprint."}
            </p>
            <button
              onClick={() => {
                if (usage && usage.projectsCount >= usage.maxProjects) {
                  setIsPremiumModalOpen(true);
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all mt-2"
            >
              <PlusIcon className="h-4 w-4" /> Create New Blueprint
            </button>
          </div>
        )}

      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <PremiumComingSoonModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        title="1 Project Limit Reached (Free Tier)"
        description="Free users can maintain 1 active software architecture blueprint. Upgrade to Premium for unlimited project workspaces."
      />
    </div>
  );
}
