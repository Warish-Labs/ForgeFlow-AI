import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { TechLogo } from "@/components/stack/TechLogo";
import {
  ArrowRightIcon,
  SparklesIcon,
  LayersIcon,
  DatabaseIcon,
  FileTextIcon,
  BotIcon,
  SearchIcon,
} from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  const techStackList = [
    "Next.js",
    "React",
    "TypeScript",
    "PostgreSQL",
    "Prisma",
    "TailwindCSS",
    "Redis",
    "Python",
    "Docker",
    "OpenAI",
    "AWS",
    "Clerk",
    "Vitest",
    "Supabase",
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f8fafc] selection:bg-[#3b82f6] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#3b82f6]/20 bg-[#000000]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-[#2563eb] flex items-center justify-center font-bold text-white text-xs font-mono shadow-md shadow-blue-500/20">
              FF
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-[#f8fafc]">
              FORGEFLOW<span className="text-[#38bdf8]">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-[#cbd5e1]">
            <a href="#features" className="hover:text-[#38bdf8] transition-colors">
              Platform Features
            </a>
            <a href="#stack" className="hover:text-[#38bdf8] transition-colors">
              Tech Engine
            </a>
            <a href="#architecture" className="hover:text-[#38bdf8] transition-colors">
              Architecture
            </a>

            {userId ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded border border-[#3b82f6] bg-[#0b1120] px-3.5 py-1.5 text-xs font-medium text-[#38bdf8] hover:bg-[#2563eb] hover:text-white transition-all shadow-sm"
              >
                Go to Workspace <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/sign-in"
                  className="hover:text-[#38bdf8] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded bg-[#2563eb] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-all shadow-md shadow-blue-500/20"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-[1200px] mx-auto text-center flex flex-col items-center">
        {/* Category Tag Pill */}
        <div className="pill-tag mb-8 uppercase tracking-widest text-[10px]">
          INDUSTRIAL AI ARCHITECTURE SYNTHESIS ENGINE
        </div>

        {/* Hero Logo Mosaic Artifact */}
        <div className="mb-8 grid grid-cols-5 gap-1.5 opacity-90">
          <div className="h-4 w-4 bg-[#2563eb]" />
          <div className="h-4 w-4 bg-[#38bdf8]/80" />
          <div className="h-4 w-4 bg-[#2563eb]" />
          <div className="h-4 w-4 bg-[#38bdf8]/40" />
          <div className="h-4 w-4 bg-[#2563eb]" />
          <div className="h-4 w-4 bg-[#38bdf8]/60" />
          <div className="h-4 w-4 bg-[#2563eb]" />
          <div className="h-4 w-4 bg-[#38bdf8]/90" />
          <div className="h-4 w-4 bg-[#2563eb]" />
          <div className="h-4 w-4 bg-[#38bdf8]/30" />
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl md:text-[44px] font-normal tracking-[-1.85px] leading-[1.13] text-[#f8fafc] max-w-[720px] mb-6">
          Architectural Precision Engine for Production Engineering
        </h1>

        <p className="text-sm md:text-base text-[#cbd5e1] max-w-[580px] leading-relaxed mb-10">
          Synthesize full-stack software blueprints, enforce strict ADR records, generate version-tracked specifications, and perform live web tech research.
        </p>

        {/* Action Button & Ghost Link */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href={userId ? "/dashboard" : "/sign-up"}
            className="inline-flex items-center gap-2 rounded bg-[#2563eb] px-6 py-3 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-500/25"
          >
            {userId ? "Open Dashboard Workspace" : "Start Building Free"} <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-1 text-xs text-[#f8fafc] hover:text-[#38bdf8] transition-colors py-2"
          >
            Explore Platform Features →
          </a>
        </div>
      </section>

      {/* Interactive Tech Marquee */}
      <section id="stack" className="py-12 border-y border-[#3b82f6]/20 bg-[#050814] overflow-hidden">
        <div className="text-center mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b]">
            SUPPORTED FRAMEWORKS & INFRASTRUCTURE LOGOS
          </span>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee gap-8 items-center py-2">
            {[...techStackList, ...techStackList].map((tech, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 rounded-[100px] border border-[#3b82f6]/25 bg-[#0b1120] px-4 py-1.5 text-xs text-[#f8fafc] shrink-0 hover:border-[#38bdf8] transition-colors"
              >
                <TechLogo name={tech} className="h-4 w-4 shrink-0" />
                <span className="font-mono text-xs text-[#f8fafc]">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Column Grid Features Section */}
      <section id="features" className="py-24 px-6 max-w-[1200px] mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="pill-tag uppercase tracking-widest text-[10px] inline-block">
            ATOMS INDUSTRIAL PLATFORM
          </div>
          <h2 className="text-2xl md:text-3xl font-normal tracking-[-1px] text-[#f8fafc]">
            Machined Components for Architectural Excellence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-8 space-y-4 hover:border-[#3b82f6] transition-all">
            <div className="h-10 w-10 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-base font-medium text-[#f8fafc]">AI Requirement Synthesis</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              LangGraph-powered multi-stage analysis converts raw software vision into validated functional & non-functional technical scope.
            </p>
            <div className="pt-2 border-t border-[#3b82f6]/15 flex items-center gap-1 text-xs text-[#38bdf8]">
              <span>Zero-Unvalidated Output</span> →
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-8 space-y-4 hover:border-[#3b82f6] transition-all">
            <div className="h-10 w-10 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
              <LayersIcon className="h-5 w-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-base font-medium text-[#f8fafc]">System Topology & ADRs</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Model component boundaries, entity data schemas, and immutable Architecture Decision Records (ADRs) with explicit trade-off rationale.
            </p>
            <div className="pt-2 border-t border-[#3b82f6]/15 flex items-center gap-1 text-xs text-[#38bdf8]">
              <span>Relational Integrity</span> →
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-8 space-y-4 hover:border-[#3b82f6] transition-all">
            <div className="h-10 w-10 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
              <SearchIcon className="h-5 w-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-base font-medium text-[#f8fafc]">Tavily Live Web Search</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Query real-time web documentation, benchmark comparisons, and framework updates directly inside your project architecture workspace.
            </p>
            <div className="pt-2 border-t border-[#3b82f6]/15 flex items-center gap-1 text-xs text-[#38bdf8]">
              <span>Live Web Search Tool</span> →
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-8 space-y-4 hover:border-[#3b82f6] transition-all">
            <div className="h-10 w-10 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
              <DatabaseIcon className="h-5 w-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-base font-medium text-[#f8fafc]">Implementation Roadmap</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Sequenced delivery milestones (MVP, Phase 2, Phase 3) with explicit prerequisite dependency graph tracking.
            </p>
            <div className="pt-2 border-t border-[#3b82f6]/15 flex items-center gap-1 text-xs text-[#38bdf8]">
              <span>Dependency Graph</span> →
            </div>
          </div>

          {/* Card 5 */}
          <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-8 space-y-4 hover:border-[#3b82f6] transition-all">
            <div className="h-10 w-10 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-base font-medium text-[#f8fafc]">10 Document Specs Workspace</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Synthesize, version-track, live edit, and download unified `.md` specifications for PRD, Architecture, Security, and Database blueprints.
            </p>
            <div className="pt-2 border-t border-[#3b82f6]/15 flex items-center gap-1 text-xs text-[#38bdf8]">
              <span>Versioned Specs</span> →
            </div>
          </div>

          {/* Card 6 */}
          <div className="rounded border border-[#3b82f6]/20 bg-[#050814] p-8 space-y-4 hover:border-[#3b82f6] transition-all">
            <div className="h-10 w-10 rounded border border-[#3b82f6]/40 bg-[#0b1120] flex items-center justify-center">
              <BotIcon className="h-5 w-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-base font-medium text-[#f8fafc]">AI Architecture Copilot</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Domain-guarded interactive copilot trained on your exact project state with formatted Markdown responses and single-tenant privacy.
            </p>
            <div className="pt-2 border-t border-[#3b82f6]/15 flex items-center gap-1 text-xs text-[#38bdf8]">
              <span>Topic Restriction Guard</span> →
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3b82f6]/20 py-12 px-6 bg-[#050814]">
        <div className="mx-auto flex max-w-[1200px] flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-[#2563eb] flex items-center justify-center text-[8px] font-bold text-white">FF</div>
            <span className="font-mono text-[#f8fafc]">FORGEFLOW AI</span>
            <span>— Precision Software Architecture Engine</span>
          </div>
          <div>Electric Blue Palette • PostgreSQL • LangGraph • Tavily API</div>
        </div>
      </footer>
    </div>
  );
}
