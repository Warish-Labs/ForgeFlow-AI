import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SparklesIcon, CompassIcon, ListChecksIcon, NetworkIcon, MapIcon, ShieldCheckIcon } from "lucide-react";

export const metadata = {
  title: "About Us | ForgeFlow AI",
  description: "Learn how ForgeFlow AI transforms software vision prompts into structured, reasoned, production-ready engineering blueprints.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1000px] mx-auto px-6 pt-32 pb-20 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <span className="pill-tag uppercase">ABOUT FORGEFLOW AI</span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f3f6fc]">
            Intelligent Software Architecture & Planning
          </h1>
          <p className="text-sm md:text-base text-[#9aa4b8] max-w-2xl mx-auto leading-relaxed">
            ForgeFlow AI is an agentic software architecture platform engineered to bridge the gap between high-level ideas and execution-ready software engineering plans.
          </p>
        </div>

        {/* Core Mission */}
        <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-8 space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-[#38b6ff] flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" /> What ForgeFlow AI Does
          </h2>
          <p className="text-xs md:text-sm text-[#9aa4b8] leading-relaxed">
            Traditional AI chat tools generate ephemeral, unstructured code snippets that get forgotten as conversations expand. ForgeFlow AI solves this by keeping a **persistent, version-controlled project state** stored safely in a relational database.
          </p>
          <p className="text-xs md:text-sm text-[#9aa4b8] leading-relaxed">
            When you enter a software concept, ForgeFlow AI analyzes business goals, extracts functional requirements, recommends an optimal technology stack with trade-offs, generates system architecture topologies, and creates a phased milestone roadmap.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
              <ListChecksIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f3f6fc]">Requirements Synthesis</h3>
            <p className="text-xs text-[#9aa4b8] leading-relaxed">
              Automatically breaks down broad product vision statements into categorized functional requirements and non-functional performance bounds.
            </p>
          </div>

          <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
              <NetworkIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f3f6fc]">Technology Stack Selection</h3>
            <p className="text-xs text-[#9aa4b8] leading-relaxed">
              Provides reasoned framework recommendations tailored to your product scale, including database choices, auth strategies, and deployment paths.
            </p>
          </div>

          <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
              <MapIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f3f6fc]">Phased Execution Roadmaps</h3>
            <p className="text-xs text-[#9aa4b8] leading-relaxed">
              Organizes project build tasks into sequential phases (MVP, Phase 2, Scale) with explicit prerequisite task dependency links.
            </p>
          </div>

          <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#f3f6fc]">Human-in-the-Loop Control</h3>
            <p className="text-xs text-[#9aa4b8] leading-relaxed">
              AI agent proposals require explicit user confirmation via Accept/Reject cards before updating database records or creating ADRs.
            </p>
          </div>
        </div>

        {/* Parent Brand Credit */}
        <div className="rounded-xl border border-[#1060ee]/30 bg-[#0d1220] p-6 text-center space-y-2">
          <p className="text-xs text-[#9aa4b8]">
            ForgeFlow AI is designed, developed, and maintained by <strong className="text-[#38b6ff]">WarishLabs</strong>.
          </p>
          <a
            href="https://warishlabs.in/contact"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-mono text-[#38b6ff] hover:underline"
          >
            Get in touch with WarishLabs ↗
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
