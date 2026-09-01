"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateRoadmapItemAction } from "@/lib/actions/edit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, ClockIcon, Link2Icon } from "lucide-react";

export interface RoadmapItemProp {
  id?: string;
  title: string;
  phase: string;
  status: string;
  dependsOn?: string[];
  order?: number;
}

interface RoadmapTimelineProps {
  items: RoadmapItemProp[];
  projectId?: string;
}

const phaseLabels: Record<string, string> = {
  MVP: "Phase 1 — Core MVP Release",
  PHASE_2: "Phase 2 — AI Orchestration & ADR Engine",
  PHASE_3: "Phase 3 — Scaling & Production Deployment",
};

export function RoadmapTimeline({ items, projectId: propProjectId }: RoadmapTimelineProps) {
  const router = useRouter();
  const params = useParams();
  const projectId = propProjectId || (params?.id as string) || "";

  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});

  const getItemStatus = (item: RoadmapItemProp) => {
    const key = item.id || item.title;
    return localStatuses[key] !== undefined ? localStatuses[key] : item.status;
  };

  const handleToggleStatus = async (item: RoadmapItemProp) => {
    const key = item.id || item.title;
    if (updatingItems[key]) return;

    const currentStatus = getItemStatus(item);
    const nextStatus = currentStatus === "completed" ? "todo" : "completed";

    // Optimistic local state update for instant visual feedback
    setLocalStatuses((prev) => ({ ...prev, [key]: nextStatus }));

    if (item.id && projectId) {
      setUpdatingItems((prev) => ({ ...prev, [key]: true }));
      try {
        const res = await updateRoadmapItemAction(projectId, item.id, { status: nextStatus });
        if (!res.success) {
          // Rollback on failure
          setLocalStatuses((prev) => ({ ...prev, [key]: currentStatus }));
        } else {
          router.refresh();
        }
      } catch (err) {
        console.error("Failed toggling roadmap item status:", err);
        setLocalStatuses((prev) => ({ ...prev, [key]: currentStatus }));
      } finally {
        setUpdatingItems((prev) => ({ ...prev, [key]: false }));
      }
    }
  };

  const grouped = {
    MVP: items.filter((i) => i.phase === "MVP"),
    PHASE_2: items.filter((i) => i.phase === "PHASE_2"),
    PHASE_3: items.filter((i) => i.phase === "PHASE_3"),
  };

  const phases = ["MVP", "PHASE_2", "PHASE_3"] as const;

  return (
    <div className="space-y-6">
      {phases.map((phaseKey) => {
        const phaseItems = grouped[phaseKey];
        if (!phaseItems || phaseItems.length === 0) return null;

        return (
          <div key={phaseKey} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-cyan)]">
                {phaseLabels[phaseKey] || phaseKey}
              </span>
              <span className="rounded bg-[var(--navy-700)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
                {phaseItems.length} Milestones
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {phaseItems.map((item, idx) => {
                const currentStatus = getItemStatus(item);
                const isDone = currentStatus === "completed";
                const isInProg = currentStatus === "in_progress";
                const key = item.id || item.title;
                const isUpdating = updatingItems[key];

                return (
                  <Card
                    key={item.id || idx}
                    className={`bg-[var(--navy-800)]/60 border-[var(--border-subtle)] transition-all hover:border-[var(--border-accent)] ${
                      isDone ? "border-emerald-900/40 bg-emerald-950/10" : ""
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={isUpdating}
                          className="mt-0.5 flex shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer disabled:opacity-50"
                          title={isDone ? "Click to uncheck milestone (mark as todo)" : "Click to check milestone (mark as completed)"}
                        >
                          {isDone ? (
                            <CheckCircle2Icon className="h-5 w-5 text-emerald-400 hover:text-emerald-300 transition-colors" />
                          ) : isInProg ? (
                            <ClockIcon className="h-5 w-5 text-[var(--accent-cyan)] animate-pulse hover:text-emerald-400 transition-colors" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-[var(--border-default)] hover:border-emerald-400 hover:bg-emerald-500/20 transition-all" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[var(--accent-muted)]">
                              M{idx + 1}.
                            </span>
                            <h4
                              onClick={() => handleToggleStatus(item)}
                              className={`font-semibold cursor-pointer transition-all ${
                                isDone
                                  ? "line-through text-[#5c6980]"
                                  : "text-[var(--text-primary)] hover:text-[#38b6ff]"
                              }`}
                              title={isDone ? "Click to uncheck milestone" : "Click to mark milestone as completed"}
                            >
                              {item.title}
                            </h4>
                          </div>

                          {item.dependsOn && item.dependsOn.length > 0 && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <Link2Icon className="h-3 w-3 text-[var(--accent-blue)]" /> Prerequisites:
                              </span>
                              {item.dependsOn.map((dep) => (
                                <span
                                  key={dep}
                                  className="rounded bg-[var(--navy-700)] px-1.5 py-0.5 font-mono text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                                >
                                  {dep}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={isUpdating}
                          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                          title={isDone ? "Click to mark as todo" : "Click to mark as completed"}
                        >
                          <Badge variant={isDone ? "completed" : isInProg ? "in_progress" : "draft"}>
                            {currentStatus}
                          </Badge>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
