"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayersIcon, AlertTriangleIcon, CheckCircle2Icon, TagIcon } from "lucide-react";

export interface DecisionCardProps {
  id?: string;
  decision: string;
  reasoning: string;
  alternative?: string | null;
  affectedAreas?: string[];
}

export function DecisionCard({
  decision,
  reasoning,
  alternative,
  affectedAreas = [],
}: DecisionCardProps) {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--navy-800)]/60 transition-all hover:border-[var(--border-accent)]">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-glow)] border border-[var(--border-accent)]">
            <LayersIcon className="h-4 w-4 text-[var(--accent-blue)]" />
          </div>
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
            {decision}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        {/* Rationale */}
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/40 p-3">
          <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
            <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400" /> Architectural Rationale
          </span>
          <p className="text-[var(--text-muted)] leading-relaxed">{reasoning}</p>
        </div>

        {/* Rejected Alternative */}
        {alternative && (
          <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-3">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-400" /> Rejected Alternative
            </span>
            <p className="text-amber-200/80 leading-relaxed">{alternative}</p>
          </div>
        )}

        {/* Affected Areas */}
        {affectedAreas.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <TagIcon className="h-3 w-3" /> Impact:
            </span>
            {affectedAreas.map((area) => (
              <span
                key={area}
                className="rounded bg-[var(--navy-700)] px-2 py-0.5 text-[10px] font-mono text-[var(--accent-cyan)] border border-[var(--border-subtle)]"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
