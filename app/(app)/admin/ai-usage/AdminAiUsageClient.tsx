"use client";

import { AdminMetricsResult, getModelPricingAction } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CpuIcon, ServerIcon, DollarSignIcon, ActivityIcon } from "lucide-react";

interface AdminAiUsageClientProps {
  metrics: AdminMetricsResult;
  pricings: Awaited<ReturnType<typeof getModelPricingAction>>;
}

export function AdminAiUsageClient({ metrics, pricings }: AdminAiUsageClientProps) {
  const { overview, providers, operations, models } = metrics;

  // Calculate estimated total cost based on pricings if available
  const pricingMap = new Map<string, { input: number; output: number }>();
  pricings.forEach((p) => {
    pricingMap.set(`${p.provider}:${p.model}`.toLowerCase(), {
      input: p.inputPricePer1mTokens,
      output: p.outputPricePer1mTokens,
    });
  });

  // Calculate total cost estimate
  let estimatedCostUSD = 0;
  models.forEach((m) => {
    const key = `${m.provider}:${m.model}`.toLowerCase();
    const rate = pricingMap.get(key) || { input: 0.15, output: 0.6 }; // Default baseline estimation ($0.15/1M in, $0.60/1M out)
    // Assume 50/50 input/output split if exact prompt/completion split not aggregated
    const cost = (m.totalTokens / 1_000_000) * ((rate.input + rate.output) / 2);
    estimatedCostUSD += cost;
  });

  return (
    <div className="space-y-6">
      {/* Cost & Volume Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#9aa4b8]">
              <span className="text-[11px] font-mono">Total Tokens (Lifetime)</span>
              <CpuIcon className="h-4 w-4 text-[#2fe6b0]" />
            </div>
            <div className="text-2xl font-bold text-[#2fe6b0]">{overview.totalTokens.toLocaleString()}</div>
            <p className="text-[10px] text-[#5c6980]">Across all providers and operations</p>
          </CardContent>
        </Card>

        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#9aa4b8]">
              <span className="text-[11px] font-mono">Total LLM Requests</span>
              <ActivityIcon className="h-4 w-4 text-[#38b6ff]" />
            </div>
            <div className="text-2xl font-bold text-[#38b6ff]">{overview.totalRequests.toLocaleString()}</div>
            <p className="text-[10px] text-[#5c6980]">Success rate: {overview.successRatePercent}%</p>
          </CardContent>
        </Card>

        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#9aa4b8]">
              <span className="text-[11px] font-mono">Est. Infrastructure Cost</span>
              <DollarSignIcon className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">${estimatedCostUSD.toFixed(4)} USD</div>
            <p className="text-[10px] text-[#5c6980]">Calculated using active model rates</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Breakdown */}
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
            <ServerIcon className="h-4 w-4 text-[#38b6ff]" /> Provider Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          {providers.map((p) => {
            const percent = overview.totalTokens > 0 ? Math.round((p.totalTokens / overview.totalTokens) * 100) : 0;
            return (
              <div key={p.provider} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold uppercase text-[#38b6ff]">{p.provider}</span>
                  <span className="font-mono text-[#9aa4b8]">
                    {p.totalTokens.toLocaleString()} tokens ({percent}%) · {p.totalRequests} calls
                  </span>
                </div>
                <div className="h-2 w-full bg-[#070a14] border border-[#1b2338] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1060ee] rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Operation & Model Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <CpuIcon className="h-4 w-4 text-[#2fe6b0]" /> Operation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">Operation</th>
                  <th className="pb-2.5 font-normal">Tokens</th>
                  <th className="pb-2.5 font-normal">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {operations.map((op) => (
                  <tr key={op.operation} className="hover:bg-[#131a2c]/50">
                    <td className="py-2.5 font-mono text-[#38b6ff] uppercase">{op.operation}</td>
                    <td className="py-2.5 font-mono text-[#2fe6b0]">{op.totalTokens.toLocaleString()}</td>
                    <td className="py-2.5 font-mono text-[#9aa4b8]">{op.totalRequests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-amber-400" /> Active Models
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">Model</th>
                  <th className="pb-2.5 font-normal">Provider</th>
                  <th className="pb-2.5 font-normal">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {models.map((m) => (
                  <tr key={`${m.provider}-${m.model}`} className="hover:bg-[#131a2c]/50">
                    <td className="py-2.5 font-mono text-[#f3f6fc]">{m.model}</td>
                    <td className="py-2.5 font-mono text-[#38b6ff] uppercase">{m.provider}</td>
                    <td className="py-2.5 font-mono text-[#2fe6b0]">{m.totalTokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
