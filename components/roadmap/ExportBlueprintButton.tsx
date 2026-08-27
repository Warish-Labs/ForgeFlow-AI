"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportBlueprintMarkdownAction } from "@/lib/actions/roadmap";
import { DownloadIcon, Loader2Icon, FileTextIcon } from "lucide-react";

interface ExportBlueprintButtonProps {
  projectId: string;
  variant?: "outline" | "secondary" | "accent" | "default";
  size?: "default" | "sm" | "lg";
}

export function ExportBlueprintButton({
  projectId,
  variant = "outline",
  size = "sm",
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
  );
}
