"use client";

import { useState } from "react";
import { updateTechStackAction } from "@/lib/actions/edit";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { PlusIcon, Trash2Icon, Edit3Icon, CheckIcon, XIcon, LayersIcon } from "lucide-react";

interface TechStackManagerProps {
  projectId: string;
  initialStack: string[];
}

export function TechStackManager({ projectId, initialStack }: TechStackManagerProps) {
  const [stack, setStack] = useState<string[]>(initialStack);
  const [newTechInput, setNewTechInput] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleAddTech() {
    if (!newTechInput.trim()) return;
    const updated = [...stack, newTechInput.trim()];
    setStack(updated);
    setNewTechInput("");
    await saveStackToDb(updated);
  }

  async function handleRemoveTech(idx: number) {
    const updated = stack.filter((_, i) => i !== idx);
    setStack(updated);
    await saveStackToDb(updated);
  }

  function handleStartEdit(idx: number) {
    setEditingIdx(idx);
    setEditValue(stack[idx]);
  }

  async function handleSaveEdit(idx: number) {
    if (!editValue.trim()) return;
    const updated = [...stack];
    updated[idx] = editValue.trim();
    setStack(updated);
    setEditingIdx(null);
    await saveStackToDb(updated);
  }

  async function saveStackToDb(newStack: string[]) {
    setIsSaving(true);
    setFeedback(null);
    const res = await updateTechStackAction(projectId, newStack);
    setIsSaving(false);
    if (res.success) {
      setFeedback("Tech stack updated and saved.");
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback("Failed to save changes.");
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayersIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Technology Stack Manager
          </h3>
          <HelpTooltip
            title="Technology Stack"
            text="First-class stack management. Add, edit, or remove technologies. AI architecture and roadmap synthesis will respect your confirmed technology choices."
          />
        </div>
        {feedback && (
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {feedback}
          </span>
        )}
      </div>

      {/* Stack Items Tags Grid */}
      <div className="flex flex-wrap gap-2">
        {stack.length > 0 ? (
          stack.map((tech, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-2.5 py-1 text-xs font-mono text-[var(--text-primary)] hover:border-[var(--accent-cyan)]/50 transition-colors"
            >
              {editingIdx === idx ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-28 rounded bg-[var(--navy-900)] px-1.5 py-0.5 text-xs text-[var(--text-primary)] border border-[var(--accent-blue)] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(idx)}
                    className="text-emerald-400 hover:text-emerald-300"
                    title="Save"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setEditingIdx(null)}
                    className="text-red-400 hover:text-red-300"
                    title="Cancel"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span>{tech}</span>
                  <button
                    onClick={() => handleStartEdit(idx)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-opacity"
                    title="Edit technology"
                  >
                    <Edit3Icon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveTech(idx)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-opacity"
                    title="Remove technology"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">
            No technology stack tags configured. Add your target stack below.
          </p>
        )}
      </div>

      {/* Add New Technology Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newTechInput}
          onChange={(e) => setNewTechInput(e.target.value)}
          placeholder="Add technology (e.g. Redis, Supabase, Tailwind, Docker)..."
          className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTech}
          disabled={isSaving || !newTechInput.trim()}
        >
          <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add Tech
        </Button>
      </div>
    </div>
  );
}
