import { SparklesIcon } from "lucide-react";

interface AiGeneratedTagProps {
  label?: string;
  className?: string;
}

export function AiGeneratedTag({ label = "AI-generated — edit anytime", className = "" }: AiGeneratedTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#38b6ff]/30 bg-[#1060ee]/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#38b6ff] ${className}`}
    >
      <SparklesIcon className="h-3 w-3" />
      {label}
    </span>
  );
}
