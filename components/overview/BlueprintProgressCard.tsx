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
    { label: "Requirements", completed: hasRequirements },
    { label: "Feature Backlog", completed: hasFeatures },
    { label: "Tech Stack", completed: hasStack },
    { label: "Architecture ADRs", completed: hasArchitecture },
    { label: "Roadmap Timeline", completed: hasRoadmap },
    { label: `Document Specs (${documentsCount})`, completed: documentsCount > 0 },
  ];

  return (
    <div className="rounded-xl border border-[#3b82f6]/30 bg-[#050814] p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#f8fafc]">
            Blueprint Completeness Score
          </h3>
          <HelpTooltip
            title="Blueprint Completeness"
            text="Calculated score based on whether essential blueprint artifacts are saved in database."
          />
        </div>
        <span className="font-mono text-sm font-bold text-[#38bdf8]">
          {totalScore}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0b1120] border border-[#3b82f6]/20">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8] transition-all duration-500"
          style={{ width: `${totalScore}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1 sm:grid-cols-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {step.completed ? (
              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <CircleIcon className="h-3.5 w-3.5 text-[#64748b] shrink-0" />
            )}
            <span className={step.completed ? "text-[#f8fafc] font-medium" : "text-[#64748b]"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
