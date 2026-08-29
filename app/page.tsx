"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AnimatedHeroLogo } from "@/components/marketing/AnimatedHeroLogo";
import { AnimatedDocumentCounter } from "@/components/home/AnimatedDocumentCounter";
import { PremiumComingSoonModal } from "@/components/ui/PremiumComingSoonModal";
import {
  CompassIcon,
  ListChecksIcon,
  NetworkIcon,
  MapIcon,
  ScrollTextIcon,
  FileTextIcon,
  HammerIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  XCircleIcon,
  LockIcon,
  CpuIcon,
  PaletteIcon,
  ZapIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

export default function LandingPage() {
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc]">
      {/* Navigation */}
      <Navbar />

      {/* ── Section 1: Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-32 border-b border-[#1b2338]">
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#38b6ff 1px, transparent 1px), linear-gradient(90deg, #38b6ff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Radial center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-[#1060ee]/15 blur-[140px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[400px] rounded-full bg-[#38b6ff]/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-[200px] w-[300px] rounded-full bg-[#2fe6b0]/8 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#38b6ff]/30 bg-[#1060ee]/10 px-5 py-1.5 text-xs font-semibold text-[#38b6ff] shadow-sm mb-8 hero-fade-1">
            <SparklesIcon className="h-3.5 w-3.5" />
            FORGEFLOW AI PLATFORM — NOW IN BETA
            <span className="h-1.5 w-1.5 rounded-full bg-[#2fe6b0] animate-pulse" />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6 hero-fade-1">
            <AnimatedHeroLogo />
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#f3f6fc] max-w-5xl mx-auto leading-[1.1] hero-fade-2">
            Turn a One-Line Idea Into a{" "}
            <span className="relative inline-block">
              <span className="text-brand-gradient">Real Engineering Plan</span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38b6ff]/60 to-transparent" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm md:text-base text-[#9aa4b8] max-w-2xl mx-auto leading-relaxed hero-fade-2">
            Persistent project state · AI-powered architecture synthesis · Human-in-the-loop planning.
            <br className="hidden md:block" />
            Never lose context in disposable AI chat windows again.
          </p>

          <div className="mt-6 flex justify-center hero-fade-2">
            <AnimatedDocumentCounter />
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 hero-fade-3">
            <Link
              href="/dashboard"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1060ee] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#0a2a9c] transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
            >
              Start Building Free
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#1b2338] bg-[#0d1220] px-8 py-3.5 text-sm font-medium text-[#f3f6fc] hover:bg-[#131a2c] hover:border-[#38b6ff]/40 transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Floating stats row */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto hero-fade-3">
            {[
              { icon: CpuIcon, stat: "AI-Powered", label: "Architecture Engine" },
              { icon: ShieldCheckIcon, stat: "Single-Tenant", label: "Secure Isolation" },
              { icon: TrendingUpIcon, stat: "5-Step", label: "Blueprint Pipeline" },
              { icon: UsersIcon, stat: "Open Beta", label: "Free to Start" },
            ].map(({ icon: Icon, stat, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-[#1b2338] bg-[#0d1220]/80 backdrop-blur-sm px-4 py-4 text-center group hover:border-[#1060ee]/50 hover:bg-[#0d1220] transition-all"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 text-[#38b6ff] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-[#f3f6fc]">{stat}</div>
                <div className="text-[11px] text-[#5c6980] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Why Project State Beats Chat ─────────────────────────── */}
      <section className="py-20 px-6 border-b border-[#1b2338] bg-[#070a14]">
        <div className="mx-auto max-w-[1200px] space-y-12">
          <div className="text-center space-y-3">
            <span className="pill-tag uppercase">PLATFORM THESIS</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#f3f6fc]">
              Why Project State Beats Chat History
            </h2>
            <p className="text-xs md:text-sm text-[#9aa4b8] max-w-xl mx-auto">
              Generic chat windows output disposable text that gets forgotten. ForgeFlow maintains a single source of truth saved in a relational database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Generic Chat Column */}
            <div className="rounded-2xl border border-red-900/30 bg-[#0d1220] p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <XCircleIcon className="h-5 w-5 shrink-0" />
                <span>Generic AI Chat History</span>
              </div>
              <ul className="space-y-3 text-xs text-[#9aa4b8]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Forgets architectural decisions after 10 messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Outputs unstructured, raw text dumps requiring manual parsing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>No single-tenant database backing or version-controlled PRDs</span>
                </li>
              </ul>
            </div>

            {/* ForgeFlow Column */}
            <div className="rounded-2xl border border-[#2fe6b0]/40 bg-[#0d1220] p-6 space-y-4 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center gap-2 text-[#2fe6b0] font-semibold text-sm">
                <CheckCircle2Icon className="h-5 w-5 shrink-0" />
                <span>ForgeFlow Persistent Project State</span>
              </div>
              <ul className="space-y-3 text-xs text-[#f3f6fc]">
                <li className="flex items-start gap-2">
                  <span className="text-[#2fe6b0] font-bold">•</span>
                  <span><strong>Single Source of Truth</strong>: Requirements, stack, and roadmap persisted in relational DB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2fe6b0] font-bold">•</span>
                  <span><strong>ForgeFlow Agent Proposal Engine</strong>: Human-in-the-loop Accept/Reject confirmation before state updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2fe6b0] font-bold">•</span>
                  <span><strong>Immutable Decision Log</strong>: Track why technologies were chosen with ADR records</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: How It Works ──────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 border-b border-[#1b2338] bg-[#070a14]">
        <div className="mx-auto max-w-[1200px] space-y-12">
          <div className="text-center space-y-3">
            <span className="pill-tag uppercase">5-STEP ARCHITECTURE PIPELINE</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#f3f6fc]">
              From Vision to Production Blueprint
            </h2>
            <p className="text-xs md:text-sm text-[#9aa4b8] max-w-xl mx-auto">
              Follow a clear, deterministic workflow from initial software concept to exported PRD markdown specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                icon: CompassIcon,
                title: "Describe Vision",
                desc: "Enter a high-level software concept explaining what you want to build.",
                color: "#1060ee",
              },
              {
                step: "02",
                icon: ListChecksIcon,
                title: "Synthesize Scope",
                desc: "AI extracts functional requirements and system performance constraints.",
                color: "#38b6ff",
              },
              {
                step: "03",
                icon: NetworkIcon,
                title: "Select Tech Stack",
                desc: "Receive a reasoned tech stack with named alternatives and ADR rationale.",
                color: "#2fe6b0",
              },
              {
                step: "04",
                icon: MapIcon,
                title: "Map Roadmap",
                desc: "Synthesize MVP, Phase 2, and Phase 3 milestone dependency tasks.",
                color: "#38b6ff",
              },
              {
                step: "05",
                icon: FileTextIcon,
                title: "Export Specs",
                desc: "Download structured Markdown specs ready for developer handoff.",
                color: "#1060ee",
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-5 space-y-3 relative group hover:border-[#1060ee] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-center justify-between text-[#5c6980]">
                    <span className="font-mono text-xs font-bold">{st.step}</span>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${st.color}15`, border: `1px solid ${st.color}30` }}>
                      <Icon className="h-4 w-4" style={{ color: st.color }} />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f3f6fc] group-hover:text-[#38b6ff] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#9aa4b8] leading-relaxed">
                    {st.desc}
                  </p>
                  {/* Step connector */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:last:hidden lg:flex">
                    <ArrowRightIcon className="h-4 w-4 text-[#1b2338]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Feature Grid ──────────────────────────────── */}
      <section id="features" className="py-20 px-6 border-b border-[#1b2338] bg-[#070a14]">
        <div className="mx-auto max-w-[1200px] space-y-12">
          <div className="text-center space-y-3">
            <span className="pill-tag uppercase">PLATFORM CAPABILITIES</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#f3f6fc]">
              What You Get in ForgeFlow
            </h2>
            <p className="text-xs md:text-sm text-[#9aa4b8] max-w-xl mx-auto">
              Everything needed to plan, design, and document complex software systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ListChecksIcon,
                title: "Structured Requirements",
                desc: "AI extracts functional scope and non-functional scalability bounds.",
                accent: "#38b6ff",
              },
              {
                icon: NetworkIcon,
                title: "Reasoned Tech Stack",
                desc: "Get framework recommendations with explicit trade-offs and alternatives.",
                accent: "#2fe6b0",
              },
              {
                icon: PaletteIcon,
                title: "UI Design & Mockups",
                desc: "Generate UI component guidelines and color palettes from markdown prompts.",
                accent: "#a78bfa",
              },
              {
                icon: ScrollTextIcon,
                title: "Searchable Decision Log",
                desc: "Maintain immutable ADR records explaining why technical choices were made.",
                accent: "#38b6ff",
              },
              {
                icon: MapIcon,
                title: "Phased Roadmap",
                desc: "Sequential milestone timeline with prerequisite task dependency links.",
                accent: "#2fe6b0",
              },
              {
                icon: HammerIcon,
                title: "ForgeFlow Agent",
                desc: "Interactive assistant with Proposal Cards and Accept/Reject confirmation.",
                accent: "#f59e0b",
              },
              {
                icon: FileTextIcon,
                title: "Markdown Export",
                desc: "Export PRDs, technical architecture, and database schemas as Markdown.",
                accent: "#38b6ff",
              },
              {
                icon: LockIcon,
                title: "Single-Tenant Security",
                desc: "Strict owner isolation guarantees project data privacy.",
                accent: "#2fe6b0",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-5 space-y-3 hover:border-[#1060ee]/60 transition-all group hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border"
                    style={{
                      backgroundColor: `${feat.accent}10`,
                      borderColor: `${feat.accent}25`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: feat.accent }} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f3f6fc] group-hover:text-[#38b6ff] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#9aa4b8] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Premium Banner ─────────────────────────────── */}
      <section className="py-16 px-6 border-b border-[#1b2338] bg-gradient-to-r from-[#070a14] via-[#0a0f1e] to-[#070a14]">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/5 via-[#0d1220] to-[#070a14] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-400/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-64 bg-amber-400/10 blur-[80px] pointer-events-none" />
            <div className="space-y-2 relative">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-mono font-semibold text-amber-400">
                  <ZapIcon className="h-3 w-3" />
                  PREMIUM — COMING SOON
                </span>
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-[#f3f6fc]">
                Unlock Unlimited Projects & 5M Token Quota
              </h3>
              <p className="text-xs text-[#9aa4b8] max-w-lg">
                Team collaboration, GitHub/Jira blueprint export, priority LLM routing, and dedicated workspace analytics.
              </p>
            </div>
            <button
              onClick={() => setIsPremiumOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-amber-400/20 transition-all whitespace-nowrap"
            >
              <ZapIcon className="h-4 w-4" />
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 6: Final CTA ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#070a14] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[#1060ee]/15 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-[1200px] rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] p-10 md:p-16 text-center space-y-6 shadow-2xl">
          <span className="pill-tag uppercase">GET STARTED FREE</span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#f3f6fc]">
            Ready to Architect Your Next Application?
          </h2>
          <p className="text-xs md:text-sm text-[#9aa4b8] max-w-xl mx-auto leading-relaxed">
            Create your first architecture project blueprint in seconds with persistent state and ForgeFlow Agent assistance.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#0a2a9c] transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Start Free Workspace
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1b2338] bg-[#0d1220] px-8 py-3.5 text-sm font-medium text-[#f3f6fc] hover:border-[#38b6ff]/40 hover:bg-[#131a2c] transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <PremiumComingSoonModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
      />
    </div>
  );
}
