"use client";

import { useState } from "react";
import { updateDecisionAction } from "@/lib/actions/edit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit2Icon, CheckIcon, XIcon, CheckCircle2Icon } from "lucide-react";

interface EditableDecisionCardProps {
  projectId: string;
  decision: {
    id: string;
    decision: string;
    reasoning: string;
    alternative?: string | null;
    affectedAreas?: string[] | null;
  };
}

export function EditableDecisionCard({ projectId, decision }: EditableDecisionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState(decision.decision);
  const [reasoning, setReasoning] = useState(decision.reasoning);
  const [alternative, setAlternative] = useState(decision.alternative || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!decisionTitle.trim() || !reasoning.trim() || isSaving) return;
    setIsSaving(true);
    const res = await updateDecisionAction(projectId, decision.id, {
      decision: decisionTitle.trim(),
      reasoning: reasoning.trim(),
      alternative: alternative.trim(),
    });
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error.message);
    }
  }

  return (
    <Card className="border-[#1b2338] bg-[#0d1220] transition-all hover:border-[#1060ee]/40">
      {!isEditing ? (
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between border-b border-[#1b2338] pb-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-4 w-4 text-[#38b6ff] shrink-0" />
              <CardTitle className="text-sm font-bold text-[#f3f6fc]">
                {decision.decision}
              </CardTitle>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1b2338] bg-[#131a2c] px-2.5 py-1 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white"
            >
              <Edit2Icon className="h-3 w-3" /> Edit ADR
            </button>
          </div>

          <div>
            <h4 className="text-[10px] font-mono text-[#38b6ff] uppercase tracking-wider mb-1">
              Decision & Rationale
            </h4>
            <p className="text-xs text-[#9aa4b8] leading-relaxed whitespace-pre-wrap">
              {decision.reasoning}
            </p>
          </div>

          {decision.alternative && (
            <div className="pt-2 border-t border-[#1b2338]">
              <h4 className="text-[10px] font-mono text-[#5c6980] uppercase tracking-wider mb-1">
                Rejected Alternative
              </h4>
              <p className="text-xs text-[#9aa4b8] leading-relaxed">
                {decision.alternative}
              </p>
            </div>
          )}

          {decision.affectedAreas && decision.affectedAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {decision.affectedAreas.map((area) => (
                <span
                  key={area}
                  className="rounded bg-[#131a2c] px-2 py-0.5 text-[10px] font-mono text-[#38b6ff] border border-[#1b2338]"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
              Decision Title
            </label>
            <input
              type="text"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
              Reasoning & Rationale
            </label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] p-2.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#f3f6fc] block mb-1">
              Rejected Alternative (Optional)
            </label>
            <input
              type="text"
              value={alternative}
              onChange={(e) => setAlternative(e.target.value)}
              className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
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
              <CheckIcon className="h-3 w-3" /> {isSaving ? "Saving..." : "Save ADR"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
