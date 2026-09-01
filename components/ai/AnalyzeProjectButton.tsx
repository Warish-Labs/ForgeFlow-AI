"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { analyzeProjectAction, resumeProjectSynthesisAction } from "@/lib/actions/ai";
import { AskUserQuestionnaireModal } from "@/components/ai/AskUserQuestionnaireModal";
import { QuestionItem } from "@/lib/validations/ai";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { SparklesIcon, Loader2Icon, AlertCircleIcon, XIcon, CheckCircle2Icon } from "lucide-react";

interface AnalyzeProjectButtonProps {
  projectId: string;
  variant?: "accent" | "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  showTooltip?: boolean;
}

export function AnalyzeProjectButton({
  projectId,
  variant = "accent",
  size = "sm",
  showTooltip = true,
}: AnalyzeProjectButtonProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepText, setStepText] = useState("Analyze Vision");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<{
    functionalCount: number;
    nonFunctionalCount: number;
    featuresCount: number;
    assumptionsCount: number;
    questionsCount: number;
  } | null>(null);

  // Ask-User Question Modal state
  const [pendingQuestions, setPendingQuestions] = useState<QuestionItem[] | null>(null);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSuccessSummary(null);
    setStepText("1/3 Evaluating Architecture Stack...");

    const t1 = setTimeout(() => setStepText("2/3 Synthesizing Dependencies..."), 1200);

    const result = await analyzeProjectAction(projectId);

    clearTimeout(t1);
    setIsAnalyzing(false);
    setStepText("Re-analyze Vision");

    if (!result.success) {
      setAnalysisError(result.error.message);
      return;
    }

    if (result.data.status === "NEEDS_INPUT" && result.data.questions) {
      setPendingQuestions(result.data.questions);
      return;
    }

    if (result.data.summary) {
      setSuccessSummary(result.data.summary);
    }

    router.refresh();
  }

  async function handleQuestionnaireSubmit(answers: Record<string, unknown>) {
    setIsSubmittingAnswers(true);
    setAnalysisError(null);
    setSuccessSummary(null);
    const result = await resumeProjectSynthesisAction(projectId, answers);
    setIsSubmittingAnswers(false);

    if (!result.success) {
      setAnalysisError(result.error.message);
      return;
    }

    if (result.data.status === "NEEDS_INPUT" && result.data.questions) {
      setPendingQuestions(result.data.questions);
      return;
    }

    if (result.data.summary) {
      setSuccessSummary(result.data.summary);
    }

    setPendingQuestions(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="inline-flex items-center gap-1.5">
        <Button
          variant={variant}
          size={size}
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 font-medium transition-all"
          title="Analyze software vision idea using AI synthesis"
        >
          {isAnalyzing ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin text-[var(--accent-cyan)]" />
              <span>{stepText}</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
              <span>{stepText}</span>
            </>
          )}
        </Button>
        <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#1060ee]/15 text-[#38b6ff] border border-[#1060ee]/30">
          Uses AI Quota
        </span>
        {showTooltip && (
          <HelpTooltip
            title="Analyze Vision Action"
            text="WHAT: AI parses your software idea vision statement and evaluates technology choices. WHEN: Right after creating a project or updating your vision. OUTPUT: Structured requirements, architecture, and feature blueprint."
            side="bottom"
          />
        )}
      </div>

      {successSummary && (
        <div className="my-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-lg w-full max-w-md">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-200">Analysis Complete!</span>
              <div className="text-[11px] text-emerald-300/90 font-mono mt-0.5">
                ✓ Requirements: {successSummary.functionalCount + successSummary.nonFunctionalCount} ({successSummary.functionalCount} functional, {successSummary.nonFunctionalCount} non-functional) • Features: {successSummary.featuresCount} • Assumptions: {successSummary.assumptionsCount}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSuccessSummary(null)}
            className="text-emerald-400 hover:text-white"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {analysisError && (
        <div className="my-1 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 text-rose-400 shrink-0" />
            <span>AI Analysis Diagnostic: {analysisError}</span>
          </div>
          <button
            onClick={() => setAnalysisError(null)}
            className="text-rose-400 hover:text-white"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {pendingQuestions && (
        <AskUserQuestionnaireModal
          isOpen={Boolean(pendingQuestions)}
          questions={pendingQuestions}
          onSubmit={handleQuestionnaireSubmit}
          isSubmitting={isSubmittingAnswers}
        />
      )}
    </div>
  );
}

