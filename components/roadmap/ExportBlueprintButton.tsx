"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportBlueprintMarkdownAction } from "@/lib/actions/roadmap";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { DownloadIcon, Loader2Icon } from "lucide-react";

interface ExportBlueprintButtonProps {
  projectId: string;
  variant?: "outline" | "secondary" | "accent" | "default";
  size?: "default" | "sm" | "lg";
  showTooltip?: boolean;
}

export function ExportBlueprintButton({
  projectId,
  variant = "outline",
  size = "sm",
  showTooltip = true,
}: ExportBlueprintButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    const result = await exportBlueprintMarkdownAction(projectId);
    setIsExporting(false);

    if (!result.success) {
      alert(`Export Failed: ${result.error.message}`);
      return;
    }

    // Trigger direct client-side file download
    const blob = new Blob([result.data.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.data.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 font-medium transition-colors"
        title="Download complete technical blueprint document (.md)"
      >
        {isExporting ? (
          <Loader2Icon className="h-4 w-4 animate-spin text-[var(--accent-cyan)]" />
        ) : (
          <DownloadIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
        )}
        <span>{isExporting ? "Exporting..." : "Export Blueprint (.md)"}</span>
      </Button>
      {showTooltip && (
        <HelpTooltip
          title="Export Blueprint Action"
          text="WHAT: Compiles requirements, tech stack, architecture ADRs, and roadmap into a single Markdown file. WHEN: Whenever you want to share, present, or archive your project documentation."
          side="bottom"
        />
      )}
    </div>
  );
}
