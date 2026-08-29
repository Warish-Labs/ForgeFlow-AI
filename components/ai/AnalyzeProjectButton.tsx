"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { analyzeProjectAction, resumeProjectSynthesisAction } from "@/lib/actions/ai";
import { AskUserQuestionnaireModal } from "@/components/ai/AskUserQuestionnaireModal";
import { QuestionItem } from "@/lib/validations/ai";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { SparklesIcon, Loader2Icon } from "lucide-react";

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

  // Ask-User Question Modal state
  const [pendingQuestions, setPendingQuestions] = useState<QuestionItem[] | null>(null);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setStepText("1/3 Evaluating Architecture Stack...");

    const t1 = setTimeout(() => setStepText("2/3 Synthesizing Dependencies..."), 1200);

    const result = await analyzeProjectAction(projectId);

    clearTimeout(t1);
    setIsAnalyzing(false);
    setStepText("Analyze Vision");

    if (!result.success) {
      alert(`AI Analysis Failed: ${result.error.message}`);
      return;
    }

    if (result.data.status === "NEEDS_INPUT" && result.data.questions) {
      setPendingQuestions(result.data.questions);
      return;
    }

    router.refresh();
  }

  async function handleQuestionnaireSubmit(answers: Record<string, any>) {
    setIsSubmittingAnswers(true);
    const result = await resumeProjectSynthesisAction(projectId, answers);
    setIsSubmittingAnswers(false);

    if (!result.success) {
      alert(`Synthesis error: ${result.error.message}`);
      return;
    }

    if (result.data.status === "NEEDS_INPUT" && result.data.questions) {
      setPendingQuestions(result.data.questions);
      return;
    }

    setPendingQuestions(null);
    router.refresh();
  }

  return (
    <>
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
              <span>Analyze Vision</span>
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

      {pendingQuestions && (
        <AskUserQuestionnaireModal
          isOpen={Boolean(pendingQuestions)}
          questions={pendingQuestions}
          onSubmit={handleQuestionnaireSubmit}
          isSubmitting={isSubmittingAnswers}
        />
      )}
    </>
  );
}
