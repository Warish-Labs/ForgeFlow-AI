"use client";

import { AdminMetricsResult } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon, FolderGit2Icon, CpuIcon, ActivityIcon,
  CheckCircle2Icon, BarChart3Icon, MailIcon, FileTextIcon,
  MessageSquareIcon, ServerIcon,
} from "lucide-react";

interface AdminOverviewClientProps {
  metrics: AdminMetricsResult;
}

export function AdminOverviewClient({ metrics }: AdminOverviewClientProps) {
  const { overview, providers, operations, models } = metrics;

  const statCards = [
    { label: "Total Users", value: overview.totalUsers, color: "text-[#38b6ff]", Icon: UsersIcon, sub: "Distinct tenants" },
    { label: "Total Projects", value: overview.totalProjects, color: "text-[#38b6ff]", Icon: FolderGit2Icon, sub: "Active workspaces" },
    { label: "Watchlist", value: overview.totalWatchlistSubscribers, color: "text-amber-400", Icon: MailIcon, sub: "Priority waitlist" },
    { label: "Tokens (Month)", value: `${(overview.tokensThisMonth / 1000).toFixed(1)}k`, color: "text-[#2fe6b0]", Icon: CpuIcon, sub: "LLM tokens this month" },
    { label: "Tokens (Today)", value: `${(overview.tokensToday / 1000).toFixed(1)}k`, color: "text-[#38b6ff]", Icon: BarChart3Icon, sub: "Tokens used today" },
    { label: "Requests (Month)", value: overview.requestsThisMonth, color: "text-amber-400", Icon: ActivityIcon, sub: "Monthly AI operations" },
    { label: "Success Rate", value: `${overview.successRatePercent}%`, color: "text-[#f3f6fc]", Icon: CheckCircle2Icon, sub: `${overview.failedRequests} failures` },
    { label: "Documents", value: overview.totalDocuments, color: "text-[#2fe6b0]", Icon: FileTextIcon, sub: "Generated blueprints" },
    { label: "Messages", value: overview.totalContactMessages, color: "text-rose-400", Icon: MessageSquareIcon, sub: "Contact submissions" },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, color, Icon, sub }) => (
          <Card key={label} className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <p className="text-[10px] text-[#5c6980]">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider & Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-[#38b6ff]" /> Provider Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-2.5">
            {providers.length === 0 ? (
              <p className="text-xs text-[#5c6980]">No provider usage recorded yet.</p>
            ) : providers.map((p) => (
              <div key={p.provider} className="rounded-xl border border-[#1b2338] bg-[#070a14] p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold uppercase text-[#38b6ff]">{p.provider}</span>
                  <span className="text-[#9aa4b8] font-mono text-[10px]">{p.totalRequests} calls</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#5c6980]">
                  <span>Tokens:</span>
                  <span className="font-mono text-[#f3f6fc] font-semibold">{p.totalTokens.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <CpuIcon className="h-4 w-4 text-[#2fe6b0]" /> Operation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-2">
            {operations.length === 0 ? (
              <p className="text-xs text-[#5c6980]">No operations recorded yet.</p>
            ) : operations.map((op) => (
              <div key={op.operation} className="flex items-center justify-between text-xs py-1 border-b border-[#1b2338]/40">
                <span className="font-mono text-[#9aa4b8] uppercase">{op.operation}</span>
                <span className="font-mono text-[#2fe6b0]">
                  {op.totalTokens.toLocaleString()} tokens · {op.totalRequests} reqs
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Model usage */}
      {models.length > 0 && (
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4 text-[#38b6ff]" /> Model Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">Model</th>
                  <th className="pb-2.5 font-normal">Provider</th>
                  <th className="pb-2.5 font-normal">Tokens</th>
                  <th className="pb-2.5 font-normal">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {models.map((m) => (
                  <tr key={`${m.provider}-${m.model}`} className="hover:bg-[#131a2c]/50">
                    <td className="py-2 font-mono text-[11px] text-[#38b6ff]">{m.model}</td>
                    <td className="py-2 font-mono text-[11px] uppercase text-[#9aa4b8]">{m.provider}</td>
                    <td className="py-2 font-mono text-[#2fe6b0]">{m.totalTokens.toLocaleString()}</td>
                    <td className="py-2 font-mono text-[#9aa4b8]">{m.totalRequests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
