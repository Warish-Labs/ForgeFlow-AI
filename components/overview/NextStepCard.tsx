"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";

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
    title = "Next Action: Analyze Software Vision";
    description = "Run AI requirement synthesis to extract functional requirements, system constraints, and initial features.";
    buttonLabel = "Analyze Vision";
    action = onAnalyzeVision;
  } else if (!hasArchitecture) {
    title = "Next Action: Synthesize System Architecture";
    description = "Generate component topology diagrams, data schemas, and immutable Architecture Decision Records (ADRs).";
    buttonLabel = "Synthesize Architecture";
    action = onGenerateArchitecture;
  } else if (!hasRoadmap) {
    title = "Next Action: Build Implementation Roadmap";
    description = "Synthesize sequential delivery milestones (MVP, Phase 2, Phase 3) and dependency links.";
    buttonLabel = "Build Roadmap";
    action = onGenerateRoadmap;
  } else if (!hasDocuments) {
    title = "Next Action: Compile & Export Project Specs";
    description = "Compile blueprint into implementation-ready markdown specifications (PRD, Architecture, ADRs, Roadmap).";
    buttonLabel = "Open Documents";
    action = `/projects/${projectId}/documents`;
  } else {
    title = "🎉 Blueprint Complete & Production Ready!";
    description = "Your software blueprint is ready. Use the Copilot to ask technical questions or download markdown exports.";
    buttonLabel = "View Documents";
    action = `/projects/${projectId}/documents`;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#c8ad86]/40 bg-[#0a0a0a] p-5 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c8ad86]/40 bg-[#121212] text-[#c8ad86]">
          {hasRequirements && hasArchitecture && hasRoadmap && hasDocuments ? (
            <CheckCircle2Icon className="h-5 w-5 text-emerald-400" />
          ) : (
            <SparklesIcon className="h-5 w-5 text-[#c8ad86]" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#fff7dd]">
            {title}
          </h3>
          <p className="mt-1 text-xs text-[#fff7dd]/70 max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 self-end sm:self-auto">
        {typeof action === "string" ? (
          <Link
            href={action}
            className="inline-flex items-center gap-1.5 rounded border border-[#c8ad86] bg-[#c8ad86] px-4 py-2 text-xs font-semibold text-[#000000] hover:bg-[#b09570] transition-all"
          >
            {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <button
            onClick={action}
            className="inline-flex items-center gap-1.5 rounded border border-[#c8ad86] bg-[#c8ad86] px-4 py-2 text-xs font-semibold text-[#000000] hover:bg-[#b09570] transition-all"
          >
            {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
