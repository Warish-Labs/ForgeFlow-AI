"use client";

import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

interface BlueprintProgressProps {
  hasVision: boolean;
  hasRequirements: boolean;
  hasFeatures: boolean;
  hasStack: boolean;
  hasArchitecture: boolean;
  hasRoadmap: boolean;
  documentsCount: number;
}

export function BlueprintProgressCard({
  hasVision,
  hasRequirements,
  hasFeatures,
  hasStack,
  hasArchitecture,
  hasRoadmap,
  documentsCount,
}: BlueprintProgressProps) {
  // Calculate completeness percentage based on actual saved state
  let totalScore = 0;
  if (hasVision) totalScore += 15;
  if (hasRequirements) totalScore += 15;
  if (hasFeatures) totalScore += 15;
  if (hasStack) totalScore += 15;
  if (hasArchitecture) totalScore += 15;
  if (hasRoadmap) totalScore += 15;
  if (documentsCount > 0) totalScore += 10;

  const steps = [
    { label: "Software Vision", completed: hasVision },
    { label: "Requirements Synthesis", completed: hasRequirements },
    { label: "Feature Extraction", completed: hasFeatures },
    { label: "Technology Stack", completed: hasStack },
    { label: "Architecture & ADRs", completed: hasArchitecture },
    { label: "Implementation Roadmap", completed: hasRoadmap },
    { label: `Document Specs (${documentsCount})`, completed: documentsCount > 0 },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Blueprint Completeness
          </h3>
          <HelpTooltip
            title="Blueprint Completeness"
            text="Calculated score based on whether essential blueprint artifacts (requirements, features, architecture decisions, roadmap, docs) are present in the database."
          />
        </div>
        <span className="font-mono text-sm font-bold text-[var(--accent-cyan)]">
          {totalScore}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--navy-800)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] transition-all duration-500"
          style={{ width: `${totalScore}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1 sm:grid-cols-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            {step.completed ? (
              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <CircleIcon className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            )}
            <span className={step.completed ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)]"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
