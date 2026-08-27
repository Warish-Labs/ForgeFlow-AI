"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRoadmapItemAction } from "@/lib/actions/edit";
import { Card } from "@/components/ui/card";
import { Edit2Icon, CheckIcon, XIcon, CheckCircle2Icon, ClockIcon, CircleIcon } from "lucide-react";

interface EditableRoadmapCardProps {
  projectId: string;
  item: {
    id: string;
    title: string;
    phase: "MVP" | "PHASE_2" | "PHASE_3";
    status: string;
    dependsOn?: string[] | null;
  };
}

const statusCycle: Record<string, string> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
};

export function EditableRoadmapCard({ projectId, item }: EditableRoadmapCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [phase, setPhase] = useState<"MVP" | "PHASE_2" | "PHASE_3">(item.phase);
  const [status, setStatus] = useState(item.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  async function handleSave() {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    const res = await updateRoadmapItemAction(projectId, item.id, { title: title.trim(), phase, status });
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(res.error.message);
    }
  }

  async function handleQuickToggle() {
    if (isToggling) return;
    setIsToggling(true);
    const nextStatus = statusCycle[status] || "pending";
    const res = await updateRoadmapItemAction(projectId, item.id, { status: nextStatus });
    if (res.success) {
      setStatus(nextStatus);
      router.refresh();
    }
    setIsToggling(false);
  }

  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  const StatusIcon = isCompleted ? CheckCircle2Icon : isInProgress ? ClockIcon : CircleIcon;
  const statusColor = isCompleted ? "text-[#2fe6b0]" : isInProgress ? "text-[#38b6ff] animate-pulse" : "text-[#5c6980]";

  return (
    <Card className={`border-[#1b2338] bg-[#0d1220] p-3.5 transition-all hover:border-[#1060ee]/40 ${isCompleted ? "border-[#2fe6b0]/20 bg-[#0a1a12]" : ""}`}>
      {!isEditing ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleQuickToggle}
              disabled={isToggling}
              title={`Click to mark as: ${statusCycle[status] || "pending"}`}
              className="shrink-0 hover:scale-110 transition-transform"
            >
              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            </button>
            <div>
              <p className={`text-xs font-bold ${isCompleted ? "line-through text-[#5c6980]" : "text-[#f3f6fc]"}`}>{title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-[#38b6ff] font-semibold">{phase}</span>
                <span className="text-[10px] text-[#5c6980]">•</span>
                <span className={`text-[10px] capitalize font-medium ${isCompleted ? "text-[#2fe6b0]" : isInProgress ? "text-[#38b6ff]" : "text-[#9aa4b8]"}`}>
                  {status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded p-1 text-[#9aa4b8] hover:text-[#38b6ff] hover:bg-[#131a2c]"
          >
            <Edit2Icon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] font-semibold text-[#f3f6fc] block mb-1">Milestone Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-[#f3f6fc] block mb-1">Phase</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value as any)} className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-2 py-1 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none">
                <option value="MVP">MVP (Phase 1)</option>
                <option value="PHASE_2">Phase 2</option>
                <option value="PHASE_3">Phase 3</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#f3f6fc] block mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-2 py-1 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-1 rounded border border-[#1b2338] bg-[#131a2c] px-2 py-0.5 text-xs font-medium text-[#9aa4b8]">
              <XIcon className="h-3 w-3" /> Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-1 rounded bg-[#1060ee] px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-[#0a2a9c]">
              <CheckIcon className="h-3 w-3" /> {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
