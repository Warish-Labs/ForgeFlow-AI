"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, SparklesIcon, CheckCircle2Icon, Loader2Icon, AlertCircleIcon } from "lucide-react";
import { analyzeProjectAction } from "@/lib/actions/ai";
import { generateArchitectureAction } from "@/lib/actions/architecture";
import { generateRoadmapAction } from "@/lib/actions/roadmap";

interface NextStepCardProps {
  projectId: string;
  hasRequirements: boolean;
  hasArchitecture: boolean;
  hasRoadmap: boolean;
  hasDocuments: boolean;
}

export function NextStepCard({
  projectId,
  hasRequirements,
  hasArchitecture,
  hasRoadmap,
  hasDocuments,
}: NextStepCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  let title = "";
  let description = "";
  let buttonLabel = "";
  let actionType: "analyze" | "architecture" | "roadmap" | "link" = "link";
  let targetUrl = `/projects/${projectId}/documents`;

  if (!hasRequirements) {
    title = "Next Action: Analyze Software Vision";
    description = "Run AI requirement synthesis to extract functional requirements, system constraints, and initial features.";
    buttonLabel = "Analyze Vision";
    actionType = "analyze";
  } else if (!hasArchitecture) {
    title = "Next Action: Synthesize System Architecture";
    description = "Generate component topology diagrams, data schemas, and immutable Architecture Decision Records (ADRs).";
    buttonLabel = "Synthesize Architecture";
    actionType = "architecture";
  } else if (!hasRoadmap) {
    title = "Next Action: Build Implementation Roadmap";
    description = "Synthesize sequential delivery milestones (MVP, Phase 2, Phase 3) and dependency links.";
    buttonLabel = "Build Roadmap";
    actionType = "roadmap";
  } else if (!hasDocuments) {
    title = "Next Action: Compile & Export Project Specs";
    description = "Compile blueprint into implementation-ready markdown specifications (PRD, Architecture, ADRs, Roadmap).";
    buttonLabel = "Open Documents";
    actionType = "link";
  } else {
    title = "🎉 Blueprint Complete & Production Ready!";
    description = "Your software blueprint is ready. Use the Copilot to ask technical questions or download markdown exports.";
    buttonLabel = "View Documents";
    actionType = "link";
  }

  async function handleActionClick() {
    if (actionType === "link") return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let res: { success: boolean; error?: { message: string } };

      if (actionType === "analyze") {
        res = await analyzeProjectAction(projectId);
      } else if (actionType === "architecture") {
        res = await generateArchitectureAction(projectId);
      } else {
        res = await generateRoadmapAction(projectId);
      }

      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error?.message || "Action failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#3b82f6]/40 bg-[#050814] p-5 shadow-2xl space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#3b82f6]/40 bg-[#0b1120] text-[#38bdf8]">
            {hasRequirements && hasArchitecture && hasRoadmap && hasDocuments ? (
              <CheckCircle2Icon className="h-5 w-5 text-emerald-400" />
            ) : (
              <SparklesIcon className="h-5 w-5 text-[#38bdf8]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc]">{title}</h3>
            <p className="mt-1 text-xs text-[#cbd5e1] max-w-xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-auto">
          {actionType === "link" ? (
            <Link
              href={targetUrl}
              className="inline-flex items-center gap-1.5 rounded bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-all shadow-md shadow-blue-500/20"
            >
              {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button
              onClick={handleActionClick}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
