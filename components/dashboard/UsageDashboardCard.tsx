"use client";

import { useState } from "react";
import { QuotaUsageResult } from "@/lib/services/quota";
import { PremiumComingSoonModal } from "@/components/ui/PremiumComingSoonModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SparklesIcon, CpuIcon, LayersIcon, ClockIcon, LockIcon } from "lucide-react";

interface UsageDashboardCardProps {
  usage: QuotaUsageResult;
}

export function UsageDashboardCard({ usage }: UsageDashboardCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projectPercent = Math.min(100, Math.round((usage.projectsCount / usage.maxProjects) * 100));
  const tokenPercent = Math.min(100, Math.round((usage.totalTokens / usage.maxTokens) * 100));
  const requestPercent = Math.min(100, Math.round((usage.totalRequests / usage.maxRequests) * 100));

  const statusColors = {
    healthy: "text-[#2fe6b0] bg-[#2fe6b0]/10 border-[#2fe6b0]/30",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    critical: "text-rose-400 bg-rose-400/10 border-rose-400/30",
    exhausted: "text-red-500 bg-red-500/10 border-red-500/30",
  };

  return (
    <>
      <Card className="border-[#1b2338] bg-[#0d1220] transition-all hover:border-[#1060ee]/40">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#1060ee]/20 border border-[#1060ee]/40 flex items-center justify-center text-[#38b6ff]">
              <CpuIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#f3f6fc]">
                Account AI Usage & Plan Limits
              </CardTitle>
              <p className="text-[11px] text-[#9aa4b8]">
                Server-enforced monthly quota & tenant bounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {usage.isAdmin ? (
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border border-[#38b6ff]/40 bg-[#1060ee]/20 text-[#38b6ff]">
                SUPER ADMIN (UNLIMITED)
              </span>
            ) : (
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${
                  statusColors[usage.status]
                }`}
              >
                {usage.status}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1060ee]/40 bg-[#131a2c] px-3 py-1 text-xs font-semibold text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
            >
              <SparklesIcon className="h-3 w-3" /> Upgrade
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Projects Quota */}
            <div className="rounded-xl border border-[#1b2338] bg-[#070a14] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#9aa4b8] flex items-center gap-1.5">
                  <LayersIcon className="h-3.5 w-3.5 text-[#38b6ff]" /> Active Projects
                </span>
                <span className="font-mono font-bold text-[#f3f6fc]">
                  {usage.projectsCount} / {usage.maxProjects}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#131a2c] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    projectPercent >= 100 ? "bg-amber-400" : "bg-[#1060ee]"
                  }`}
                  style={{ width: `${projectPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-[#5c6980]">
                {usage.projectsCount >= usage.maxProjects
                  ? "Free limit reached (1 Project max)"
                  : `${usage.maxProjects - usage.projectsCount} project slot remaining`}
              </p>
            </div>

            {/* Token Quota */}
            <div className="rounded-xl border border-[#1b2338] bg-[#070a14] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#9aa4b8] flex items-center gap-1.5">
                  <CpuIcon className="h-3.5 w-3.5 text-[#38b6ff]" /> AI Token Quota
                </span>
                <span className="font-mono font-bold text-[#f3f6fc]">
                  {(usage.totalTokens / 1000).toFixed(1)}k / {(usage.maxTokens / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#131a2c] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    tokenPercent >= 90
                      ? "bg-rose-500"
                      : tokenPercent >= 75
                      ? "bg-amber-400"
                      : "bg-[#2fe6b0]"
                  }`}
                  style={{ width: `${tokenPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-[#5c6980]">
                {(usage.remainingTokens / 1000).toFixed(1)}k tokens available
              </p>
            </div>

            {/* Requests Quota */}
            <div className="rounded-xl border border-[#1b2338] bg-[#070a14] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#9aa4b8] flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5 text-[#38b6ff]" /> AI Requests
                </span>
                <span className="font-mono font-bold text-[#f3f6fc]">
                  {usage.totalRequests} / {usage.maxRequests}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#131a2c] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    requestPercent >= 90 ? "bg-rose-500" : "bg-[#38b6ff]"
                  }`}
                  style={{ width: `${requestPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-[#5c6980]">
                Monthly reset on {usage.resetDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PremiumComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upgrade to ForgeFlow Premium"
        description="Unlock unlimited projects, priority Groq Llama-3 70B AI execution, and team blueprint sync."
      />
    </>
  );
}
