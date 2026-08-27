"use client";

import { useState } from "react";
import { updateFeatureItemAction, deleteFeatureItemAction } from "@/lib/actions/edit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit2Icon, Trash2Icon, CheckIcon, XIcon } from "lucide-react";

interface EditableFeatureCardProps {
  projectId: string;
  feature: {
    id: string;
    title: string;
    description: string | null;
    phase: "MVP" | "PHASE_2" | "PHASE_3";
    status: string;
  };
}

export function EditableFeatureCard({ projectId, feature }: EditableFeatureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(feature.title);
  const [description, setDescription] = useState(feature.description || "");
  const [phase, setPhase] = useState<"MVP" | "PHASE_2" | "PHASE_3">(feature.phase);
  const [status, setStatus] = useState(feature.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    const res = await updateFeatureItemAction(projectId, feature.id, {
      title: title.trim(),
      description: description.trim(),
      phase,
      status,
    });
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error.message);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${feature.title}"?`)) return;
    setIsDeleting(true);
    const res = await deleteFeatureItemAction(projectId, feature.id);
    setIsDeleting(false);
    if (!res.success) {
      alert(res.error.message);
    }
  }

  return (
    <Card className="border-[#1b2338] bg-[#0d1220] transition-all hover:border-[#1060ee]/40">
      {!isEditing ? (
        <>
          <CardHeader className="p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-[#f3f6fc]">
                {feature.title}
              </CardTitle>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#131a2c] text-[#38b6ff] border border-[#1b2338]">
                {feature.phase}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded p-1 text-[#9aa4b8] hover:text-[#38b6ff] hover:bg-[#131a2c]"
                title="Edit Feature"
              >
                <Edit2Icon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded p-1 text-[#9aa4b8] hover:text-red-400 hover:bg-red-950/40"
                title="Delete Feature"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-[#9aa4b8] leading-relaxed">
              {feature.description || "No description provided."}
            </p>
          </CardContent>
        </>
      ) : (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
              Feature Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
                Phase Target
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as any)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
              >
                <option value="MVP">MVP (Phase 1)</option>
                <option value="PHASE_2">Phase 2 (Growth)</option>
                <option value="PHASE_3">Phase 3 (Scale)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] p-2.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1b2338] bg-[#131a2c] px-2.5 py-1 text-xs font-medium text-[#9aa4b8]"
            >
              <XIcon className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1060ee] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0a2a9c]"
            >
              <CheckIcon className="h-3 w-3" /> {isSaving ? "Saving..." : "Save Feature"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
