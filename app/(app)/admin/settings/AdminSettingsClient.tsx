"use client";

import { useState } from "react";
import { getModelPricingAction, upsertModelPricingAction } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsIcon, DollarSignIcon, PlusIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

interface AdminSettingsClientProps {
  pricings: Awaited<ReturnType<typeof getModelPricingAction>>;
}

export function AdminSettingsClient({ pricings: initialPricings }: AdminSettingsClientProps) {
  const [pricings, setPricings] = useState(initialPricings);

  // Form state
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [inputPrice, setInputPrice] = useState("0.15");
  const [outputPrice, setOutputPrice] = useState("0.60");
  const [isSaving, setIsSaving] = useState(false);
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
      // Refresh pricing list locally
      const updated = await getModelPricingAction();
      setPricings(updated);
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

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                5. System & Audit Logs
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Switch between System Telemetry / Execution Traces and Governance Audit Logs (role updates, bans, pricing changes).
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                6. Documents Registry
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Inspect generated architecture specs across all tenants with creator name resolution and user ID tooltip inspection.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                7. Support Inbox
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Read contact submissions, toggle read/unread status, dispatch direct email replies via Resend, and archive messages with confirmation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#1b2338] bg-[#070a14] space-y-1">
              <span className="font-bold text-[#38b6ff] flex items-center gap-1.5 font-mono text-[11px]">
                8. Settings & Pricing
              </span>
              <p className="text-[#9aa4b8] text-[11px] leading-relaxed">
                Configure baseline $/1M input/output token pricing rates per LLM provider to calculate accurate platform expenditure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Pricing Config */}
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
                step="0.01"
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
                step="0.01"
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
                      <td className="py-2.5 font-mono text-[#2fe6b0]">${p.inputPricePer1mTokens.toFixed(2)}</td>
                      <td className="py-2.5 font-mono text-amber-400">${p.outputPricePer1mTokens.toFixed(2)}</td>
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
