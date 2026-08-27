"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NextStepCardProps {
  projectId: string;
  hasRequirements: boolean;
  hasArchitecture: boolean;
  hasRoadmap: boolean;
  hasDocuments: boolean;
  onAnalyzeVision?: () => void;
  onGenerateArchitecture?: () => void;
  onGenerateRoadmap?: () => void;
}

export function NextStepCard({
  projectId,
  hasRequirements,
  hasArchitecture,
  hasRoadmap,
  hasDocuments,
  onAnalyzeVision,
  onGenerateArchitecture,
  onGenerateRoadmap,
}: NextStepCardProps) {
  let title = "";
  let description = "";
  let buttonLabel = "";
  let action: (() => void) | string | undefined;

  if (!hasRequirements) {
    title = "Next Step: Analyze Software Vision";
    description = "Run AI requirement synthesis to extract problem statements, functional requirements, and initial features.";
    buttonLabel = "Analyze Vision";
    action = onAnalyzeVision;
  } else if (!hasArchitecture) {
    title = "Next Step: Generate System Architecture";
    description = "Synthesize modular component topology, data persistence schemas, and formal Architecture Decision Records (ADRs).";
    buttonLabel = "Generate Architecture";
    action = onGenerateArchitecture;
  } else if (!hasRoadmap) {
    title = "Next Step: Generate Implementation Roadmap";
    description = "Synthesize sequential delivery milestones (MVP, Phase 2, Phase 3) and dependency links.";
    buttonLabel = "Generate Roadmap";
    action = onGenerateRoadmap;
  } else if (!hasDocuments) {
    title = "Next Step: Generate & Export Project Documents";
    description = "Compile your blueprint into implementation-ready markdown specifications (PRD, Architecture, ADRs, Roadmap).";
    buttonLabel = "Open Documents Tab";
    action = `/projects/${projectId}/documents`;
  } else {
    title = "🎉 Blueprint Ready for Implementation!";
    description = "Your software blueprint is complete. Use the Copilot to ask technical questions or download markdown exports.";
    buttonLabel = "View Documents";
    action = `/projects/${projectId}/documents`;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[var(--border-accent)] bg-gradient-to-r from-[var(--navy-900)] to-[var(--navy-800)] p-5 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-accent)] bg-[var(--navy-800)] text-[var(--accent-cyan)]">
          {hasRequirements && hasArchitecture && hasRoadmap && hasDocuments ? (
            <CheckCircle2Icon className="h-5 w-5 text-emerald-400" />
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 self-end sm:self-auto">
        {typeof action === "string" ? (
          <Link href={action}>
            <Button variant="accent" size="sm">
              {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="accent" size="sm" onClick={action}>
            {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
