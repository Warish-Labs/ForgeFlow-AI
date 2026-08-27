"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, ClockIcon, ArrowRightIcon, Link2Icon } from "lucide-react";

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
}

const phaseLabels: Record<string, string> = {
  MVP: "Phase 1 — Core MVP Release",
  PHASE_2: "Phase 2 — AI Orchestration & ADR Engine",
  PHASE_3: "Phase 3 — Scaling & Production Deployment",
};

export function RoadmapTimeline({ items }: RoadmapTimelineProps) {
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
                const isDone = item.status === "completed";
                const isInProg = item.status === "in_progress";

                return (
                  <Card
                    key={item.id || idx}
                    className={`bg-[var(--navy-800)]/60 border-[var(--border-subtle)] transition-all hover:border-[var(--border-accent)] ${
                      isDone ? "border-emerald-900/40 bg-emerald-950/10" : ""
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex shrink-0 items-center justify-center">
                          {isDone ? (
                            <CheckCircle2Icon className="h-4 w-4 text-emerald-400" />
                          ) : isInProg ? (
                            <ClockIcon className="h-4 w-4 text-[var(--accent-cyan)] animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-[var(--border-default)]" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[var(--accent-muted)]">
                              M{idx + 1}.
                            </span>
                            <h4 className="font-semibold text-[var(--text-primary)]">
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
                        <Badge variant={isDone ? "completed" : isInProg ? "in_progress" : "draft"}>
                          {item.status}
                        </Badge>
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
