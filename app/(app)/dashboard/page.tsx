import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Your software blueprints
          </p>
        </div>
        <Button asChild variant="accent" size="sm">
          <Link href="/projects/new" id="new-project-btn">
            <PlusIcon className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Empty state — will be replaced with project cards in Phase 1 */}
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--navy-800)]/40 py-20 text-center"
        role="region"
        aria-label="No projects"
      >
        {/* Hub icon — echoes the og-image motif */}
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
            <circle
              cx="12"
              cy="12"
              r="3"
              fill="currentColor"
              opacity="0.8"
            />
            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.4"
            />
            <line
              x1="12"
              y1="4"
              x2="12"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="12"
              y1="16"
              x2="12"
              y2="20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="4"
              y1="12"
              x2="8"
              y2="12"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="12"
              x2="20"
              y2="12"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-lg font-medium text-[var(--text-primary)]">
          No projects yet
        </h2>
        <p className="mb-6 max-w-sm text-sm text-[var(--text-muted)] leading-relaxed">
          Describe a software idea and ForgeFlow will turn it into a structured,
          reasoned, implementation-ready blueprint.
        </p>

        <Button asChild variant="accent">
          <Link href="/projects/new" id="empty-state-new-project-btn">
            <PlusIcon className="h-4 w-4" />
            Start your first project
          </Link>
        </Button>
      </div>
    </div>
  );
}
