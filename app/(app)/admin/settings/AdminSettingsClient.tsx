"use client";

import { useState } from "react";
import { getModelPricingAction, upsertModelPricingAction } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsIcon, DollarSignIcon, PlusIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon, RefreshCwIcon, CpuIcon, LayersIcon } from "lucide-react";

interface AdminSettingsClientProps {
  pricings: Awaited<ReturnType<typeof getModelPricingAction>>;
}

const STATIC_MODEL_METADATA = [
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    displayName: "Groq Llama 3.3 70B Versatile",
    contextWindow: "128,000 tokens",
    rateLimit: "30 RPM / 6,000 TPM",
    role: "Primary Synthesis & Blueprint Engine",
    status: "active",
  },
  {
    provider: "gemini",
    model: "gemini-2.5-flash",
    displayName: "Google Gemini 2.5 Flash",
    contextWindow: "1,048,576 tokens",
    rateLimit: "15 RPM / 1,000,000 TPM",
    role: "Secondary Fallback & Multimodal Analysis",
    status: "active",
  },
  {
    provider: "google",
    model: "text-embedding-004",
    displayName: "Google Text Embedding 004",
    contextWindow: "8,192 tokens",
    rateLimit: "1,500 RPM / 10,000,000 TPM",
    role: "Vector Knowledge & Semantic RAG Search",
    status: "active",
  },
];

export function AdminSettingsClient({ pricings: initialPricings }: AdminSettingsClientProps) {
  const [pricings, setPricings] = useState(initialPricings);

  // Form state
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [inputPrice, setInputPrice] = useState("0.15");
  const [outputPrice, setOutputPrice] = useState("0.60");
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    const res = await upsertModelPricingAction({
      provider,
      model,
      inputPricePer1mTokens: parseFloat(inputPrice) || 0,
      outputPricePer1mTokens: parseFloat(outputPrice) || 0,
    });

    setStatus(res);
    setIsSaving(false);

    if (res.success) {
      const updated = await getModelPricingAction();
      setPricings(updated);
      setLastChecked(new Date().toLocaleTimeString());
    }
  }

  async function handleRefreshTelemetry() {
    setIsRefreshing(true);
    try {
      const updated = await getModelPricingAction();
      setPricings(updated);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (_) {
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Super Admin Governance Quick Reference */}
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-[#38b6ff]" /> Super Admin Governance Guide
          </CardTitle>
          <p className="text-[11px] text-[#9aa4b8] mt-0.5">
            Quick reference reminder of administrative capabilities and capabilities across this panel.
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                1. Overview Tab
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Monitor live calculated database aggregates: registered users, active projects, LLM token usage, request counts, and success rates.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                2. Users Directory
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Inspect registered users, view computed token usage/projects, trigger session password resets, ban accounts, and dispatch email broadcasts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                3. Subscriptions / Waitlist
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Review priority waitlist & premium interest signups. Filter signups and dispatch instant confirmation or announcement emails.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                4. AI Usage Analytics
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Analyze operational telemetry: LLM provider distributions (Groq vs Gemini), model breakdowns, operation types, and latency metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Capabilities & Token Context Window Telemetry */}
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <CpuIcon className="h-4 w-4 text-[#38b6ff]" /> AI Provider Limits & Technical Reference
            </CardTitle>
            <p className="text-[11px] text-[#9aa4b8] mt-0.5">
              Live context windows, tier rate limits, and platform operational roles across connected LLM engines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#5c6980]">
              Last Checked: <strong className="text-[#38b6ff]">{lastChecked}</strong>
            </span>
            <button
              onClick={handleRefreshTelemetry}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1b2338] bg-[#070a14] px-2.5 py-1 text-[11px] font-mono text-[#38b6ff] hover:bg-[#131a2c] transition-all disabled:opacity-50"
            >
              <RefreshCwIcon className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATIC_MODEL_METADATA.map((m) => {
              const matchedPricing = pricings.find((p) => p.model === m.model);
              return (
                <div key={m.model} className="rounded-xl border border-[#1b2338] bg-[#070a14] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#38b6ff] px-2 py-0.5 rounded bg-[#1060ee]/15 border border-[#1060ee]/30">
                      {m.provider}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> {m.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#f3f6fc]">{m.displayName}</h4>
                    <p className="text-[10px] text-[#9aa4b8] mt-0.5">{m.role}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#1b2338] text-[11px] font-mono">
                    <div className="flex justify-between text-[#9aa4b8]">
                      <span>Context Window:</span>
                      <span className="text-[#f3f6fc] font-semibold">{m.contextWindow}</span>
                    </div>
                    <div className="flex justify-between text-[#9aa4b8]">
                      <span>Rate Limits:</span>
                      <span className="text-[#38b6ff] font-semibold">{m.rateLimit}</span>
                    </div>
                    <div className="flex justify-between text-[#9aa4b8]">
                      <span>Input $/1M Tokens:</span>
                      <span className="text-emerald-400 font-semibold">
                        ${matchedPricing ? matchedPricing.inputPricePer1mTokens.toFixed(3) : "0.150"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#9aa4b8]">
                      <span>Output $/1M Tokens:</span>
                      <span className="text-amber-400 font-semibold">
                        ${matchedPricing ? matchedPricing.outputPricePer1mTokens.toFixed(3) : "0.600"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Model Pricing Config Form */}
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4 text-amber-400" /> AI Model Pricing Rates (cost estimation)
          </CardTitle>
          <p className="text-[11px] text-[#9aa4b8] mt-0.5">
            Configure rates per 1 million tokens. Used for global cost estimation across LLM operations.
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-6">
          {status && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${status.success ? "bg-[#2fe6b0]/10 border-[#2fe6b0]/40 text-[#2fe6b0]" : "bg-rose-500/10 border-rose-500/40 text-rose-400"}`}>
              {status.success ? <CheckCircle2Icon className="h-4 w-4" /> : <AlertCircleIcon className="h-4 w-4" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSavePricing} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-4 rounded-xl border border-[#1b2338] bg-[#070a14]">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#9aa4b8]">Provider</label>
              <input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="groq / gemini"
                className="w-full rounded-lg border border-[#1b2338] bg-[#0d1220] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none font-mono"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-mono text-[#9aa4b8]">Model Identifier</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="llama-3.3-70b-versatile"
                className="w-full rounded-lg border border-[#1b2338] bg-[#0d1220] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#9aa4b8]">Input $/1M Tokens</label>
              <input
                type="number"
                step="0.001"
                value={inputPrice}
                onChange={(e) => setInputPrice(e.target.value)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#0d1220] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#9aa4b8]">Output $/1M Tokens</label>
              <input
                type="number"
                step="0.001"
                value={outputPrice}
                onChange={(e) => setOutputPrice(e.target.value)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#0d1220] px-3 py-1.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none font-mono"
                required
              />
            </div>
            <div className="sm:col-span-5 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1060ee] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <PlusIcon className="h-3.5 w-3.5" />}
                Save Model Pricing Rate
              </button>
            </div>
          </form>

          {/* Pricing History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">Provider</th>
                  <th className="pb-2.5 font-normal">Model</th>
                  <th className="pb-2.5 font-normal">Input Price / 1M</th>
                  <th className="pb-2.5 font-normal">Output Price / 1M</th>
                  <th className="pb-2.5 font-normal">Effective Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {pricings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#5c6980]">
                      No pricing configurations recorded. Form above will add initial baseline rates.
                    </td>
                  </tr>
                ) : (
                  pricings.map((p) => (
                    <tr key={p.id} className="hover:bg-[#131a2c]/50">
                      <td className="py-2.5 font-mono text-[11px] text-[#38b6ff] uppercase">{p.provider}</td>
                      <td className="py-2.5 font-mono text-[11px] text-[#f3f6fc]">{p.model}</td>
                      <td className="py-2.5 font-mono text-[#2fe6b0]">${p.inputPricePer1mTokens.toFixed(3)}</td>
                      <td className="py-2.5 font-mono text-amber-400">${p.outputPricePer1mTokens.toFixed(3)}</td>
                      <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{p.effectiveFrom}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
