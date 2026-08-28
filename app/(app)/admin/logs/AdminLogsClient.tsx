"use client";

import { useState } from "react";
import { AdminMetricsResult } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollTextIcon, FileTextIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

interface AdminLogsClientProps {
  recentLogs: AdminMetricsResult["recentLogs"];
  auditLogs: AdminMetricsResult["auditLogs"];
}

export function AdminLogsClient({ recentLogs, auditLogs }: AdminLogsClientProps) {
  const [logFilter, setLogFilter] = useState("ALL");
  const [auditFilter, setAuditFilter] = useState("ALL");

  const filteredLogs = recentLogs.filter(
    (l) => logFilter === "ALL" || l.status === logFilter
  );

  const filteredAudit = auditLogs.filter(
    (a) => auditFilter === "ALL" || a.action === auditFilter
  );

  return (
    <div className="space-y-8">
      {/* System Audit Events Log */}
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-[#38b6ff]" /> Audit Log & Governance Events
            </CardTitle>
            <p className="text-[11px] text-[#9aa4b8] mt-0.5">
              Persistent event log: project lifecycle, quota limits, admin access, password resets
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[#070a14] border border-[#1b2338] p-1 rounded-lg">
            {["ALL", "PROJECT_CREATED", "AI_QUOTA_TRIGGERED", "ADMIN_ACCESS", "ADMIN_ACTION"].map((act) => (
              <button
                key={act}
                onClick={() => setAuditFilter(act)}
                className={`px-2.5 py-0.5 text-[10px] font-mono rounded transition-all ${
                  auditFilter === act ? "bg-[#1060ee] text-white font-semibold" : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                <th className="pb-2.5 font-normal">Timestamp</th>
                <th className="pb-2.5 font-normal">User ID</th>
                <th className="pb-2.5 font-normal">Action Event</th>
                <th className="pb-2.5 font-normal">Project ID</th>
                <th className="pb-2.5 font-normal">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
              {filteredAudit.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#5c6980]">
                    No audit log events match filter.
                  </td>
                </tr>
              ) : (
                filteredAudit.map((a) => (
                  <tr key={a.id} className="hover:bg-[#131a2c]/50">
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{a.createdAt}</td>
                    <td className="py-2.5 font-mono text-[11px] text-[#38b6ff]">{a.userId.substring(0, 16)}...</td>
                    <td className="py-2.5 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded border uppercase text-[10px] ${
                          a.action === "AI_QUOTA_TRIGGERED"
                            ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                            : a.action === "PROJECT_CREATED"
                            ? "bg-[#2fe6b0]/10 text-[#2fe6b0] border-[#2fe6b0]/30"
                            : "bg-[#1060ee]/10 text-[#38b6ff] border-[#1060ee]/30"
                        }`}
                      >
                        {a.action}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{a.projectId || "—"}</td>
                    <td className="py-2.5 font-mono text-[10px] text-[#5c6980]">
                      {JSON.stringify(a.metadata || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* AI Execution Trace Log */}
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <ScrollTextIcon className="h-4 w-4 text-[#2fe6b0]" /> AI Execution Trace Log
            </CardTitle>
            <p className="text-[11px] text-[#9aa4b8] mt-0.5">
              Trace log of LLM syntheses, search queries, token counts, latency, and status
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[#070a14] border border-[#1b2338] p-1 rounded-lg">
            {["ALL", "success", "error", "quota_exceeded"].map((st) => (
              <button
                key={st}
                onClick={() => setLogFilter(st)}
                className={`px-2.5 py-0.5 text-[10px] font-mono rounded transition-all ${
                  logFilter === st ? "bg-[#1060ee] text-white font-semibold" : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                <th className="pb-2.5 font-normal">Timestamp</th>
                <th className="pb-2.5 font-normal">Operation</th>
                <th className="pb-2.5 font-normal">Provider / Model</th>
                <th className="pb-2.5 font-normal">Tokens</th>
                <th className="pb-2.5 font-normal">Latency</th>
                <th className="pb-2.5 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#5c6980]">
                    No trace logs match filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#131a2c]/50">
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{l.createdAt}</td>
                    <td className="py-2.5 font-mono uppercase text-[#38b6ff]">{l.operation}</td>
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">
                      {l.provider} ({l.model || "default"})
                    </td>
                    <td className="py-2.5 font-mono text-[#2fe6b0]">{l.totalTokens}</td>
                    <td className="py-2.5 font-mono text-[#9aa4b8]">{l.durationMs}ms</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                          l.status === "success"
                            ? "bg-[#2fe6b0]/10 text-[#2fe6b0] border-[#2fe6b0]/30"
                            : l.status === "quota_exceeded"
                            ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {l.status === "success" ? <CheckCircle2Icon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
