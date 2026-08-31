"use client";

import { useState } from "react";
import { PermissionRequestPayload, validateToolExecutionPermission } from "@/lib/ai/tools";
import { ShieldAlertIcon, CheckCircle2Icon, XCircleIcon, TerminalIcon, GlobeIcon, FileCodeIcon, CpuIcon } from "lucide-react";

interface PermissionRequestCardProps {
  request: PermissionRequestPayload;
  onDecision?: (allowed: boolean, resultText: string) => void;
}

export function PermissionRequestCard({ request, onDecision }: PermissionRequestCardProps) {
  const [status, setStatus] = useState<"idle" | "allowed" | "denied">("idle");
  const [resultText, setResultText] = useState<string>("");

  function getToolIcon(tool: string) {
    switch (tool) {
      case "run_python":
      case "run_javascript":
      case "run_typescript":
        return <TerminalIcon className="h-4 w-4 text-[#38b6ff]" />;
      case "search_web":
        return <GlobeIcon className="h-4 w-4 text-[#2fe6b0]" />;
      case "generate_file":
        return <FileCodeIcon className="h-4 w-4 text-purple-400" />;
      default:
        return <CpuIcon className="h-4 w-4 text-amber-400" />;
    }
  }

  function handleAllow() {
    const gate = validateToolExecutionPermission(request, true);
    setStatus("allowed");
    const msg = gate.reason || "Permission granted by user.";
    setResultText(msg);
    if (onDecision) onDecision(true, msg);
  }

  function handleDeny() {
    setStatus("denied");
    const msg = "Tool execution permission denied by project owner.";
    setResultText(msg);
    if (onDecision) onDecision(false, msg);
  }

  if (status === "allowed") {
    return (
      <div className="my-3 rounded-lg border border-[#2fe6b0]/50 bg-[#2fe6b0]/10 p-3 space-y-1 text-xs">
        <div className="flex items-center gap-2 text-[#2fe6b0] font-semibold">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>Tool Permission Granted ({request.tool})</span>
        </div>
        <p className="text-[#f3f6fc] text-[11px] font-mono">{resultText}</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="my-3 rounded-lg border border-red-900/40 bg-red-950/20 p-3 space-y-1 text-xs text-red-300">
        <div className="flex items-center gap-2 font-semibold">
          <XCircleIcon className="h-4 w-4 text-red-400" />
          <span>Tool Permission Denied ({request.tool})</span>
        </div>
        <p className="text-[11px] font-mono">{resultText}</p>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-lg border border-[#38b6ff]/40 bg-[#0d1220] p-4 space-y-3 text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1b2338] pb-2">
        <div className="flex items-center gap-2">
          {getToolIcon(request.tool)}
          <span className="font-semibold text-[#f3f6fc]">ForgeFlow Agent Permission Request</span>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
            request.risk === "high"
              ? "bg-red-950/80 text-red-400 border border-red-800"
              : request.risk === "medium"
              ? "bg-amber-950/80 text-amber-400 border border-amber-800"
              : "bg-[#1060ee]/20 text-[#38b6ff] border border-[#1060ee]/40"
          }`}
        >
          {request.risk} Risk
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <ShieldAlertIcon className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[#f3f6fc] font-medium leading-relaxed">
            ForgeFlow Agent requests permission to execute <code className="font-mono text-[#38b6ff]">{request.tool}</code>.
          </p>
        </div>

        <div className="rounded bg-[#070a14] border border-[#1b2338] p-2 text-[11px]">
          <span className="text-[#5c6980] font-mono uppercase text-[9px] block">Reason:</span>
          <p className="text-[#9aa4b8] mt-0.5">{request.reason}</p>
        </div>

        {request.args && Object.keys(request.args).length > 0 && (
          <div className="rounded bg-[#070a14] border border-[#1b2338] p-2 text-[11px] font-mono">
            <span className="text-[#5c6980] uppercase text-[9px] block">Tool Parameters:</span>
            <pre className="text-[#38b6ff] text-[10px] overflow-x-auto mt-0.5">
              {JSON.stringify(request.args, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Decision Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#1b2338]">
        <button
          onClick={handleAllow}
          className="inline-flex items-center gap-1.5 rounded border border-[#2fe6b0] bg-[#2fe6b0]/15 px-3.5 py-1.5 text-xs font-semibold text-[#2fe6b0] hover:bg-[#2fe6b0] hover:text-[#070a14] transition-all shadow-sm"
        >
          <CheckCircle2Icon className="h-3.5 w-3.5" />
          Allow Execution
        </button>

        <button
          onClick={handleDeny}
          className="inline-flex items-center gap-1.5 rounded border border-[#1b2338] bg-[#131a2c] px-3 py-1.5 text-xs font-medium text-[#9aa4b8] hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/40 transition-all"
        >
          <XCircleIcon className="h-3.5 w-3.5" />
          Deny
        </button>
      </div>
    </div>
  );
}
