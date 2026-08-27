"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { SparklesIcon, InfoIcon } from "lucide-react";

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

  if (!isOpen) return null;

  function handleAutoFillDemo() {
    const demo = DEMO_PROJECT_TEMPLATES[Math.floor(Math.random() * DEMO_PROJECT_TEMPLATES.length)];
    setName(demo.name);
    setIdeaText(demo.ideaText);
    setTechStackInput(demo.techStack);
    setErrorMsg(null);
  }

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

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error.message);
      return;
    }

    setName("");
    setIdeaText("");
    setTechStackInput("");
    onClose();

    router.push(`/projects/${result.data.id}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-[var(--text-primary)]">
              Create New Project Blueprint
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Describe your software vision. ForgeFlow will synthesize requirements, architecture & roadmaps.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--navy-800)] hover:text-[var(--text-primary)]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Demo Fill Quick Action */}
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/60 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <InfoIcon className="h-3.5 w-3.5 text-[var(--accent-cyan)] shrink-0" />
            Want to test quickly?
          </span>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="inline-flex items-center gap-1 font-mono font-medium text-[var(--accent-cyan)] hover:underline"
          >
            <SparklesIcon className="h-3 w-3" /> Auto-Fill Demo Idea
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="project-name" className="text-xs font-medium text-[var(--text-secondary)]">
                Project Name <span className="text-[var(--accent-cyan)]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
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
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="project-idea" className="text-xs font-medium text-[var(--text-secondary)]">
                Software Idea & Vision <span className="text-[var(--accent-cyan)]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
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
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="project-stack" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Target Stack (Optional, comma-separated)
            </label>
            <input
              id="project-stack"
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. Next.js, PostgreSQL, Tailwind, Groq LLM"
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating Blueprint..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
