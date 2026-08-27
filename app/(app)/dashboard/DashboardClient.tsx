"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard, ProjectCardData } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { PlusIcon, SparklesIcon } from "lucide-react";

export function DashboardClient({ initialProjects }: { initialProjects: ProjectCardData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              Project Blueprints
            </h1>
            <HelpTooltip
              title="ForgeFlow Workspace"
              text="Your project dashboard contains all software blueprints, requirement specs, topology decisions, ADR logs, and release roadmaps."
            />
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your AI-orchestrated software architectures
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          id="new-project-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
          New Blueprint
        </Button>
      </div>

      {/* Guidance Banner */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--navy-800)]/40 p-4 text-xs">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-[var(--accent-cyan)] shrink-0" />
          <span className="text-[var(--text-secondary)] font-medium">Project Blueprint Workflow:</span>
          <span className="text-[var(--text-muted)]">
            Idea → Requirements → Features → System Architecture → ADRs → Roadmap → Document Export
          </span>
        </div>
        <HelpTooltip
          title="Blueprint Statuses"
          text="Draft: New idea text. Analyzed: Requirements extracted. Architecture Ready: System topology & ADRs modeled. Roadmap Ready: Implementation order ready."
          side="left"
        />
      </div>

      {/* Projects Grid or Empty State */}
      {initialProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {initialProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--navy-800)]/40 py-20 text-center"
          role="region"
          aria-label="No projects"
        >
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-800)]"
            aria-hidden="true"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--accent-cyan)]"
            >
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8" />
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.4"
              />
              <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
              <line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <h2 className="mb-2 text-lg font-medium text-[var(--text-primary)]">
            No projects yet
          </h2>
          <p className="mb-6 max-w-sm text-sm text-[var(--text-muted)] leading-relaxed">
            Describe a software idea and ForgeFlow will turn it into a structured,
            reasoned, implementation-ready blueprint.
          </p>

          <Button
            variant="accent"
            id="empty-state-new-project-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Start your first project
          </Button>
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
