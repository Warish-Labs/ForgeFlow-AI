"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { SparklesIcon, InfoIcon, AlertTriangleIcon, XIcon } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_PROJECT_TEMPLATES = [
  {
    name: "DocuMind — AI Legal & Contract Analyzer",
    ideaText:
      "A SaaS platform for legal teams to upload contracts (PDFs), extract key indemnification clauses, detect risky liabilities using LLMs, and track agreement expiration milestones with automated email alerts.",
    techStack: "Next.js, PostgreSQL, Groq LLM, Supabase, TailwindCSS",
  },
  {
    name: "EcoTrack — AI Carbon Footprint Fleet Engine",
    ideaText:
      "An enterprise analytics dashboard for logistics companies to monitor vehicle fleet fuel consumption, calculate real-time carbon emissions, and generate automated compliance reports.",
    techStack: "Next.js 16, PostgreSQL, Prisma, Redis, TailwindCSS",
  },
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ideaText, setIdeaText] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen && !isRedirecting) return null;

  function handleAutoFillDemo() {
    const demo = DEMO_PROJECT_TEMPLATES[Math.floor(Math.random() * DEMO_PROJECT_TEMPLATES.length)];
    setName(demo.name);
    setIdeaText(demo.ideaText);
    setTechStackInput(demo.techStack);
    setErrorMsg(null);
  }

  const isVagueIdea = ideaText.trim().length > 0 && ideaText.trim().length < 25;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    if (name.trim().length < 3) {
      setErrorMsg("Project name must be at least 3 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (ideaText.trim().length < 10) {
      setErrorMsg("Software idea vision must be at least 10 characters long.");
      setIsSubmitting(false);
      return;
    }

    const stackArray = techStackInput
      ? techStackInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const result = await createProjectAction({
      name,
      ideaText,
      techStack: stackArray,
    });

    if (!result.success) {
      setIsSubmitting(false);
      setErrorMsg(result.error.message);
      return;
    }

    setIsSubmitting(false);
    setIsRedirecting(true);
    setName("");
    setIdeaText("");
    setTechStackInput("");

    router.push(`/projects/${result.data.id}`);
  }

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-6 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] p-8 text-center shadow-2xl space-y-6">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1060ee] via-[#38b6ff] to-[#2fe6b0] absolute top-0 left-0 right-0 rounded-t-2xl" />
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1060ee]/20 border border-[#1060ee]/40 text-[#38b6ff] shadow-lg shadow-[#1060ee]/20 animate-pulse">
            <SparklesIcon className="h-8 w-8 text-[#38b6ff]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#f3f6fc]">
              Creating Software Blueprint
            </h3>
            <p className="text-xs text-[#9aa4b8]">
              Setting up single-tenant database records and initializing requirement synthesis workspace...
            </p>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#1b2338] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#1060ee] via-[#38b6ff] to-[#2fe6b0] animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#202c48] bg-[#0b101d] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
        {/* Top Accent Gradient Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1060ee] via-[#38b6ff] to-[#2fe6b0]" />

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-[#f3f6fc]">
                Create New Project Blueprint
              </h2>
              <p className="mt-1 text-xs text-[#94a3b8]">
                Describe your software vision. ForgeFlow will synthesize requirements, architecture & roadmaps.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#1a2238] hover:text-[#f3f6fc] transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Demo Fill Quick Action */}
          <div className="flex items-center justify-between rounded-xl border border-[#1060ee]/30 bg-[#1060ee]/10 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 text-[#cbd5e1] font-medium">
              <InfoIcon className="h-4 w-4 text-[#38b6ff] shrink-0" />
              Want to test quickly?
            </span>
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1060ee]/20 px-2.5 py-1 text-xs font-mono font-semibold text-[#38b6ff] hover:bg-[#1060ee]/35 transition-all"
            >
              <SparklesIcon className="h-3.5 w-3.5" /> Auto-Fill Demo Idea
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs text-rose-300 space-y-1 font-mono">
              <div className="font-bold text-rose-200 uppercase tracking-wider text-[10px]">Error Notice</div>
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Vague Idea Scope Warning Guard */}
          {isVagueIdea && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-950/50 p-3 text-xs text-amber-200">
              <AlertTriangleIcon className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="text-amber-300">Idea Scope Notice:</strong> Your vision statement is concise. Adding target users and core feature goals yields higher quality requirements.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="project-name" className="text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                  Project Name <span className="text-[#38b6ff]">*</span>
                  <HelpTooltip
                    title="Project Name"
                    text="A short identifier for your software blueprint project (e.g. EcoTrack Fleet Analytics)."
                  />
                </label>
                <span className="text-[10px] font-mono text-[#94a3b8]">
                  {name.length}/50 chars (min 3)
                </span>
              </div>
              <input
                id="project-name"
                type="text"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DocuMind — AI Legal Analyzer"
                className="w-full rounded-xl border border-[#202c48] bg-[#070a14] px-3.5 py-2.5 text-xs text-[#f3f6fc] placeholder-[#64748b] focus:border-[#38b6ff] focus:ring-1 focus:ring-[#38b6ff]/30 focus:outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="project-idea" className="text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                  Software Idea & Vision <span className="text-[#38b6ff]">*</span>
                  <HelpTooltip
                    title="Software Vision"
                    text="Describe what you want to build, who will use it, the core problem it solves, and key goals. ForgeFlow extracts requirements from this."
                  />
                </label>
                <span className="text-[10px] font-mono text-[#94a3b8]">
                  {ideaText.length}/1000 chars (min 10)
                </span>
              </div>
              <textarea
                id="project-idea"
                required
                rows={4}
                maxLength={1000}
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="Describe what your application does, core user goals, key feature ideas, and main constraints..."
                className="w-full rounded-xl border border-[#202c48] bg-[#070a14] px-3.5 py-2.5 text-xs text-[#f3f6fc] placeholder-[#64748b] focus:border-[#38b6ff] focus:ring-1 focus:ring-[#38b6ff]/30 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            <div>
              <label htmlFor="project-stack" className="mb-1.5 text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                Target Stack (Optional, comma-separated)
                <HelpTooltip
                  title="Target Technology Stack"
                  text="Add technologies you plan to use (e.g. Next.js, PostgreSQL). ForgeFlow incorporates them into the system architecture and decision log."
                />
              </label>
              <input
                id="project-stack"
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="e.g. Next.js, PostgreSQL, Tailwind, Groq LLM"
                className="w-full rounded-xl border border-[#202c48] bg-[#070a14] px-3.5 py-2.5 text-xs text-[#f3f6fc] placeholder-[#64748b] focus:border-[#38b6ff] focus:ring-1 focus:ring-[#38b6ff]/30 focus:outline-none transition-all"
              />
            </div>

            <div className="mt-3 flex items-center justify-end gap-3 pt-2 border-t border-[#1a2238]">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting} className="text-[#94a3b8] hover:text-[#f3f6fc]">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#1060ee] to-[#38b6ff] hover:from-[#0a2a9c] hover:to-[#1060ee] text-white font-bold shadow-lg shadow-[#1060ee]/25 px-5 py-2"
              >
                {isSubmitting ? "Creating Blueprint..." : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
