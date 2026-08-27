"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { analyzeProjectAction } from "@/lib/actions/ai";
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

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setStepText("1/3 Vision Analysis...");

    const t1 = setTimeout(() => setStepText("2/3 Extracting Requirements..."), 1200);
    const t2 = setTimeout(() => setStepText("3/3 Saving Blueprint..."), 2400);

    const result = await analyzeProjectAction(projectId);

    clearTimeout(t1);
    clearTimeout(t2);
    setIsAnalyzing(false);
    setStepText("Analyze Vision");

    if (!result.success) {
      alert(`AI Analysis Failed: ${result.error.message}`);
      return;
    }

    router.refresh();
  }

  return (
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
      {showTooltip && (
        <HelpTooltip
          title="Analyze Vision Action"
          text="WHAT: AI parses your software idea vision statement. WHEN: Right after creating a project or updating your vision. OUTPUT: Problem statement, functional requirements, non-functional requirements, and initial feature list."
          side="bottom"
        />
      )}
    </div>
  );
}
