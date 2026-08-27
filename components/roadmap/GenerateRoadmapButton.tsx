"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateRoadmapAction } from "@/lib/actions/roadmap";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { DatabaseIcon, Loader2Icon } from "lucide-react";

interface GenerateRoadmapButtonProps {
  projectId: string;
  variant?: "accent" | "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  showTooltip?: boolean;
}

export function GenerateRoadmapButton({
  projectId,
  variant = "accent",
  size = "sm",
  showTooltip = true,
}: GenerateRoadmapButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepText, setStepText] = useState("Generate Roadmap");

  async function handleGenerate() {
    setIsGenerating(true);
    setStepText("1/3 Mapping Dependencies...");

    const t1 = setTimeout(() => setStepText("2/3 Sequencing Milestones..."), 1200);
    const t2 = setTimeout(() => setStepText("3/3 Saving Roadmap..."), 2400);

    const result = await generateRoadmapAction(projectId);

    clearTimeout(t1);
    clearTimeout(t2);
    setIsGenerating(false);
    setStepText("Generate Roadmap");

    if (!result.success) {
      alert(`Roadmap Synthesis Failed: ${result.error.message}`);
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
        title="Synthesize delivery milestones and prerequisite dependency tree"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="h-4 w-4 animate-spin text-[var(--accent-cyan)]" />
            <span>{stepText}</span>
          </>
        ) : (
          <>
            <DatabaseIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
            <span>Generate Roadmap</span>
          </>
        )}
      </Button>
      {showTooltip && (
        <HelpTooltip
          title="Generate Roadmap Action"
          text="WHAT: Synthesizes execution phases (MVP, Phase 2, Phase 3) and prerequisite dependency order. WHEN: After architecture decisions are made. OUTPUT: Timeline visualization."
          side="bottom"
        />
      )}
    </div>
  );
}
