"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ideaText, setIdeaText] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

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
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-[var(--text-primary)]">
              Create New Project Blueprint
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Describe your software idea. ForgeFlow will turn it into a structured implementation blueprint.
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

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="project-name" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Project Name <span className="text-[var(--accent-cyan)]">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. EcoTrack Fleet Analytics"
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="project-idea" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Software Idea & Vision <span className="text-[var(--accent-cyan)]">*</span>
            </label>
            <textarea
              id="project-idea"
              required
              rows={4}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Describe what your app does, key target users, and main requirements..."
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
              placeholder="e.g. Next.js, PostgreSQL, Tailwind, Supabase"
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
