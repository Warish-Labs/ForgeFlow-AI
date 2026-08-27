"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptProposalAction, ProposalPayload } from "@/lib/actions/ai";
import { CheckCircle2Icon, XCircleIcon, SparklesIcon, HammerIcon } from "lucide-react";

interface ProposalCardProps {
  projectId: string;
  proposal: ProposalPayload;
  onHandled?: () => void;
}

export function ProposalCard({ projectId, proposal, onHandled }: ProposalCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "accepted" | "rejected">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAccept() {
    setStatus("loading");
    setErrorMessage("");

    const res = await acceptProposalAction(projectId, proposal);
    if (res.success) {
      setStatus("accepted");
      router.refresh();
      if (onHandled) onHandled();
    } else {
      setStatus("idle");
      setErrorMessage(res.error.message);
    }
  }

  function handleReject() {
    setStatus("rejected");
    if (onHandled) onHandled();
  }

  if (status === "accepted") {
    return (
      <div className="my-3 rounded-lg border border-[#2fe6b0]/50 bg-[#2fe6b0]/10 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#2fe6b0] font-semibold">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>Proposal Accepted & Project State Updated</span>
        </div>
        <p className="text-[#f3f6fc]">{proposal.summary}</p>
        <span className="inline-block text-[10px] font-mono text-[#9aa4b8]">
          ADR record created • State revalidated
        </span>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="my-3 rounded-lg border border-[#1b2338] bg-[#0d1220] p-3 text-xs text-[#9aa4b8] flex items-center gap-2">
        <XCircleIcon className="h-4 w-4 text-red-400" />
        <span>Proposal rejected by user. No database changes were made.</span>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-lg border border-[#1060ee]/40 bg-[#0d1220] p-4 space-y-3 text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1b2338] pb-2">
        <div className="flex items-center gap-2">
          <HammerIcon className="h-4 w-4 text-[#38b6ff]" />
          <span className="font-semibold text-[#f3f6fc]">ForgeFlow Agent Proposal</span>
        </div>
        <span className="pill-tag text-[10px] uppercase font-mono">
          {proposal.type}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[#f3f6fc] font-medium leading-relaxed">
          {proposal.summary}
        </p>

        {proposal.affectedAreas && proposal.affectedAreas.length > 0 && (
          <div className="text-[11px] text-[#9aa4b8]">
            <span className="text-[#5c6980] font-mono uppercase text-[10px] block">
              Affected Areas:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {proposal.affectedAreas.map((area) => (
                <span
                  key={area}
                  className="rounded border border-[#1b2338] bg-[#131a2c] px-2 py-0.5 text-[10px] font-mono text-[#38b6ff]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(proposal.newValue) && (
          <div className="text-[11px] text-[#9aa4b8]">
            <span className="text-[#5c6980] font-mono uppercase text-[10px] block">
              Proposed Tech Stack Value:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {proposal.newValue.map((val) => (
                <span
                  key={val}
                  className="rounded border border-[#1060ee]/30 bg-[#070a14] px-2 py-0.5 text-[10px] font-mono text-[#f3f6fc]"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-[11px] text-red-400">{errorMessage}</p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#1b2338]">
        <button
          onClick={handleAccept}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 rounded border border-[#2fe6b0] bg-[#2fe6b0]/15 px-3.5 py-1.5 text-xs font-semibold text-[#2fe6b0] hover:bg-[#2fe6b0] hover:text-[#070a14] transition-all shadow-sm disabled:opacity-50"
        >
          <CheckCircle2Icon className="h-3.5 w-3.5" />
          {status === "loading" ? "Applying..." : "Accept Proposal"}
        </button>

        <button
          onClick={handleReject}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 rounded border border-[#1b2338] bg-[#131a2c] px-3 py-1.5 text-xs font-medium text-[#9aa4b8] hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/40 transition-all"
        >
          <XCircleIcon className="h-3.5 w-3.5" />
          Reject
        </button>
      </div>
    </div>
  );
}
