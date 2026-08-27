"use client";

import { useState } from "react";
import { updateTechStackAction } from "@/lib/actions/edit";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { TechBadge } from "@/components/stack/TechBadge";
import { TechLogo } from "@/components/stack/TechLogo";
import { PlusIcon, LayersIcon } from "lucide-react";

interface TechStackManagerProps {
  projectId: string;
  initialStack: string[];
}

const popularTechSuggestions = [
  "Next.js",
  "React",
  "TypeScript",
  "PostgreSQL",
  "Prisma",
  "TailwindCSS",
  "Redis",
  "Python",
  "Docker",
  "OpenAI",
  "AWS",
  "Clerk",
  "Vitest",
];

export function TechStackManager({ projectId, initialStack }: TechStackManagerProps) {
  const [stack, setStack] = useState<string[]>(initialStack);
  const [newTechInput, setNewTechInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleAddTech(techToAdd?: string) {
    const val = techToAdd || newTechInput.trim();
    if (!val) return;
    if (stack.includes(val)) {
      setNewTechInput("");
      return;
    }
    const updated = [...stack, val];
    setStack(updated);
    setNewTechInput("");
    await saveStackToDb(updated);
  }

  async function handleRemoveTech(name: string) {
    const updated = stack.filter((t) => t !== name);
    setStack(updated);
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
    <div className="rounded-xl border border-[#c8ad86]/30 bg-[#000000] p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayersIcon className="h-4 w-4 text-[#c8ad86]" />
          <h3 className="text-sm font-semibold text-[#fff7dd]">
            Interactive Technology Stack Manager
          </h3>
          <HelpTooltip
            title="Technology Stack"
            text="Add, edit, or remove technologies. AI architecture and roadmap synthesis will respect your confirmed technology choices."
          />
        </div>
        {feedback && (
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {feedback}
          </span>
        )}
      </div>

      {/* Active Stack Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {stack.length > 0 ? (
          stack.map((tech) => (
            <TechBadge
              key={tech}
              name={tech}
              onRemove={handleRemoveTech}
              interactive={true}
            />
          ))
        ) : (
          <p className="text-xs text-[#66635f] italic">
            No technology stack tags configured. Choose from popular technologies below or add custom ones.
          </p>
        )}
      </div>

      {/* Quick Add Popular Suggestions */}
      <div className="pt-2 border-t border-[#fff7dd]/10">
        <p className="text-[10px] font-mono text-[#66635f] uppercase tracking-wider mb-2">
          Quick-Add Technology Suggestions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {popularTechSuggestions
            .filter((t) => !stack.includes(t))
            .slice(0, 9)
            .map((tech) => (
              <button
                key={tech}
                onClick={() => handleAddTech(tech)}
                className="inline-flex items-center gap-1 rounded-full border border-[#fff7dd]/15 bg-[#0a0a0a] px-2 py-0.5 text-[10px] text-[#fff7dd]/70 hover:border-[#c8ad86] hover:text-[#c8ad86] transition-all"
              >
                <TechLogo name={tech} className="h-3 w-3" />
                <span>+ {tech}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Add New Custom Tech Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newTechInput}
          onChange={(e) => setNewTechInput(e.target.value)}
          placeholder="Add custom technology (e.g. Fastify, Rust, GraphQL)..."
          className="flex-1 rounded border border-[#fff7dd]/20 bg-[#0a0a0a] px-3 py-1.5 text-xs text-[#fff7dd] placeholder-[#66635f] focus:border-[#c8ad86] focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddTech()}
          disabled={isSaving || !newTechInput.trim()}
          className="border-[#c8ad86]/40 text-[#c8ad86] hover:bg-[#c8ad86]/10"
        >
          <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add Tech
        </Button>
      </div>
    </div>
  );
}
