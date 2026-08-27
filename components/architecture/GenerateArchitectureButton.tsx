"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateArchitectureAction } from "@/lib/actions/architecture";
import { LayersIcon, Loader2Icon } from "lucide-react";

interface GenerateArchitectureButtonProps {
  projectId: string;
  variant?: "accent" | "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
}

export function GenerateArchitectureButton({
  projectId,
  variant = "accent",
  size = "sm",
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
    setStepText("Generate ADRs");

    if (!result.success) {
      alert(`Architecture Synthesis Failed: ${result.error.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerate}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 font-medium transition-all"
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
  );
}
