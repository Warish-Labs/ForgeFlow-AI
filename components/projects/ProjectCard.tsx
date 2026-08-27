"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { deleteProjectAction } from "@/lib/actions/project";
import { LayersIcon, SparklesIcon, Trash2Icon, ArrowRightIcon } from "lucide-react";
import { ProjectStatus } from "@prisma/client";

export interface ProjectCardData {
  id: string;
  name: string;
  ideaText: string;
  techStack: unknown; // Prisma Json
  status: ProjectStatus;
  updatedAt: string | Date;
  _count?: {
    features: number;
    decisions: number;
    roadmapItems: number;
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

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const statusInfo = statusMap[project.status] ?? statusMap.PLANNING;

  const stackList: string[] = Array.isArray(project.techStack)
    ? (project.techStack as string[])
    : [];

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    await deleteProjectAction(project.id);
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--navy-800)]/60 p-5 transition-all hover:border-[var(--border-accent)] hover:bg-[var(--navy-800)] hover:shadow-lg ${
        isDeleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <Link href={`/projects/${project.id}`} className="group-hover:text-[var(--accent-cyan)] transition-colors">
            <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-1">
              {project.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100"
              title="Delete project"
              aria-label={`Delete ${project.name}`}
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="mb-4 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {project.ideaText}
        </p>

        {stackList.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {stackList.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded bg-[var(--navy-700)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent-muted)] border border-[var(--border-subtle)]"
              >
                {tech}
              </span>
            ))}
            {stackList.length > 4 && (
              <span className="rounded bg-[var(--navy-700)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                +{stackList.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[11px] text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Features count">
            <SparklesIcon className="h-3 w-3 text-[var(--accent-cyan)] opacity-70" />
            {project._count?.features ?? 0} features
          </span>
          <span className="flex items-center gap-1" title="Decisions count">
            <LayersIcon className="h-3 w-3 text-[var(--accent-blue)] opacity-70" />
            {project._count?.decisions ?? 0} decisions
          </span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] font-medium transition-colors"
        >
          View Blueprint
          <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
