import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AnimatedHeroLogo } from "@/components/marketing/AnimatedHeroLogo";
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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc]">
      {/* Navigation */}
      <Navbar />

      {/* ── Section 1: Hero with Animated Logo Construction ───────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 border-b border-[#1b2338]">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] rounded-full bg-[#1060ee]/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[200px] w-[300px] rounded-full bg-[#38b6ff]/15 blur-[90px] pointer-events-none" />

        <div className="relative mx-auto max-w-[1200px] px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#38b6ff]/30 bg-[#1060ee]/10 px-4 py-1 text-xs font-semibold text-[#38b6ff] shadow-sm">
            <SparklesIcon className="h-3.5 w-3.5" />
            FORGEFLOW AI PLATFORM
          </div>

          {/* Sequential Animated Building Logo */}
          <div className="flex justify-center pt-2">
            <AnimatedHeroLogo />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#f3f6fc] max-w-4xl mx-auto leading-tight">
            Turn a one-line idea into a <span className="text-brand-gradient">real engineering plan</span>
          </h1>

          <p className="text-sm md:text-base text-[#9aa4b8] max-w-2xl mx-auto leading-relaxed">
            Persistent project state, AI-powered architecture synthesis, and human-in-the-loop planning. Never lose context in disposable AI chat windows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-[#1060ee] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shadow-lg shadow-blue-500/25"
            >
              Start a Project <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded border border-[#1b2338] bg-[#0d1220] px-6 py-3 text-xs font-medium text-[#f3f6fc] hover:bg-[#131a2c] hover:border-[#38b6ff]/40 transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 2: Why Project State Beats Chat History ─────────────────── */}
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
            <div className="rounded-xl border border-red-900/30 bg-[#0d1220] p-6 space-y-4">
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

            {/* ForgeFlow Project State Column */}
            <div className="rounded-xl border border-[#2fe6b0]/40 bg-[#0d1220] p-6 space-y-4 shadow-xl shadow-emerald-500/5">
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

      {/* ── Section 3: How It Works ─────────────────────────────────────────── */}
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
                desc: "Enter a high-level software concept or prompt explaining what you want to build.",
              },
              {
                step: "02",
                icon: ListChecksIcon,
                title: "Synthesize Scope",
                desc: "AI extracts functional requirements and system performance constraints.",
              },
              {
                step: "03",
                icon: NetworkIcon,
                title: "Select Tech Stack",
                desc: "Receive a reasoned tech stack with named alternatives and ADR rationale.",
              },
              {
                step: "04",
                icon: MapIcon,
                title: "Map Roadmap",
                desc: "Synthesize MVP, Phase 2, and Phase 3 milestone dependency tasks.",
              },
              {
                step: "05",
                icon: FileTextIcon,
                title: "Export Specs",
                desc: "Download structured Markdown specs ready for developer handoff.",
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-5 space-y-3 relative group hover:border-[#1060ee] transition-all"
                >
                  <div className="flex items-center justify-between text-[#5c6980]">
                    <span className="font-mono text-xs font-bold">{st.step}</span>
                    <Icon className="h-5 w-5 text-[#38b6ff]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f3f6fc] group-hover:text-[#38b6ff] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#9aa4b8] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: What You Get (Feature Grid) ─────────────────────────── */}
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
              },
              {
                icon: NetworkIcon,
                title: "Reasoned Tech Stack",
                desc: "Get framework recommendations with explicit trade-offs and alternatives.",
              },
              {
                icon: PaletteIcon,
                title: "UI Design & Prompt Mockups",
                desc: "Generate UI component guidelines and color palettes from markdown prompts.",
              },
              {
                icon: ScrollTextIcon,
                title: "Searchable Decision Log",
                desc: "Maintain immutable ADR records explaining why technical choices were made.",
              },
              {
                icon: MapIcon,
                title: "Phased Roadmap",
                desc: "Sequential milestone timeline with prerequisite task dependency links.",
              },
              {
                icon: HammerIcon,
                title: "ForgeFlow Agent",
                desc: "Interactive assistant with Proposal Cards and Accept/Reject confirmation.",
              },
              {
                icon: FileTextIcon,
                title: "Markdown Export",
                desc: "Export PRDs, technical architecture, and database schemas as Markdown.",
              },
              {
                icon: LockIcon,
                title: "Single-Tenant Security",
                desc: "Strict owner isolation guarantees project data privacy.",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-5 space-y-3 hover:border-[#1060ee]/60 transition-all"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-[#1060ee]/30 bg-[#131a2c] text-[#38b6ff]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f3f6fc]">
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

      {/* ── Section 5: Final CTA Band ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#070a14] relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] p-10 md:p-16 text-center space-y-6 relative shadow-2xl">
          <div className="h-32 w-64 absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1060ee]/20 blur-[80px] pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-bold text-[#f3f6fc]">
            Ready to Architect Your Next Application?
          </h2>
          <p className="text-xs md:text-sm text-[#9aa4b8] max-w-xl mx-auto leading-relaxed">
            Create your first architecture project blueprint in seconds with persistent state and ForgeFlow Agent assistance.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded bg-[#1060ee] px-8 py-3.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shadow-xl shadow-blue-500/30"
            >
              Start Free Workspace <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
