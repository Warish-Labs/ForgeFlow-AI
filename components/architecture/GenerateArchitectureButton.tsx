"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateArchitectureAction } from "@/lib/actions/architecture";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { LayersIcon, Loader2Icon } from "lucide-react";

interface GenerateArchitectureButtonProps {
  projectId: string;
  variant?: "accent" | "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  showTooltip?: boolean;
}

export function GenerateArchitectureButton({
  projectId,
  variant = "accent",
  size = "sm",
  showTooltip = true,
}: GenerateArchitectureButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepText, setStepText] = useState("Generate ADRs");

  async function handleGenerate() {
    setIsGenerating(true);
    setStepText("1/3 Analyzing Topology...");

    const t1 = setTimeout(() => setStepText("2/3 Evaluating Trade-offs..."), 1200);
    const t2 = setTimeout(() => setStepText("3/3 Saving ADR Records..."), 2400);

    const result = await generateArchitectureAction(projectId);

    clearTimeout(t1);
    clearTimeout(t2);
    setIsGenerating(false);
    setStepText("Generate Architecture");

    if (!result.success) {
      alert(`Architecture Synthesis Failed: ${result.error.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 font-medium transition-all"
        title="Synthesize system topology & Architecture Decision Records (ADRs)"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="h-4 w-4 animate-spin text-[var(--accent-cyan)]" />
            <span>{stepText}</span>
          </>
        ) : (
          <>
            <LayersIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
            <span>Generate Architecture</span>
          </>
        )}
      </Button>
      {showTooltip && (
        <HelpTooltip
          title="Generate Architecture Action"
          text="WHAT: Synthesizes system component topology, database schemas, and Architecture Decision Records (ADRs). WHEN: After analyzing requirements. OUTPUT: Formatted ADR cards with rationale, trade-offs, and affected areas."
          side="bottom"
        />
      )}
    </div>
  );
}
