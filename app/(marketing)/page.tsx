import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  DatabaseIcon,
  GitBranchIcon,
  LayersIcon,
  NetworkIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ForgeFlow AI — Idea to Implementation Blueprint",
  description:
    "Turn a one-line software idea into a structured, reasoned, implementation-ready blueprint. Persistent project state, AI-powered architecture, human-in-the-loop planning.",
  alternates: {
    canonical: "/",
  },
};

// The hub's orbiting nodes — mirrors the og-image motif exactly
const HUB_NODES = [
  { label: "Requirements", icon: ScrollTextIcon, angle: -90, desc: "Understand goals, users & constraints" },
  { label: "Features", icon: SparklesIcon, angle: -30, desc: "Define capabilities & user stories" },
  { label: "Architecture", icon: LayersIcon, angle: 30, desc: "Design scalable system structure" },
  { label: "API Design", icon: NetworkIcon, angle: 90, desc: "Plan endpoints & data contracts" },
  { label: "Documentation", icon: GitBranchIcon, angle: 150, desc: "Auto-generate technical specs" },
  { label: "Roadmap", icon: DatabaseIcon, angle: 210, desc: "Plan milestones & delivery" },
] as const;

const FEATURES = [
  {
    icon: BrainCircuitIcon,
    title: "Agentic AI Workflows",
    desc: "LangGraph.js state graph processes your idea through analysis, architecture, and roadmap nodes — not one-shot text generation.",
  },
  {
    icon: DatabaseIcon,
    title: "Persistent Memory",
    desc: "Every decision, requirement, and architecture choice is stored. Come back a week later and the context is still there.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Impact Analysis & Consistency",
    desc: "Before any AI change is written, you see a diff + impact summary. Nothing changes without your explicit approval.",
  },
  {
    icon: SparklesIcon,
    title: "Evolving Project Intelligence",
    desc: "Ask 'why did you choose Postgres?' and get an answer from the decision log — not a re-hallucinated guess.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--navy-950)]">
      {/* ── Ambient background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      {/* Radial glow — center */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-2/3 h-[600px] w-[600px] rounded-full bg-[var(--accent-blue)] opacity-[0.06] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      {/* Cyan accent glow — right */}
      <div
        className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[var(--accent-cyan)] opacity-[0.04] blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-[var(--border-subtle)] bg-[var(--navy-950)]/70 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero section ───────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-20 pb-12 md:px-6 md:pt-28 md:pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left — headline and CTA */}
          <div className="flex flex-col gap-6">
            {/* Pill badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-glow)] px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-cyan)]" />
              <span className="text-xs font-medium text-[var(--accent-cyan)]">
                Agentic AI · Human-in-the-loop
              </span>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="text-[var(--text-primary)]">Why </span>
                <span className="text-gradient">Project State</span>
              </h1>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl text-[var(--text-primary)]">
                Beats Chat History
              </h1>
            </div>

            <p className="text-base text-[var(--text-secondary)] md:text-lg leading-relaxed max-w-md">
              From a one-line idea to a complete, reasoned{" "}
              <span className="text-[var(--accent-cyan)]">
                implementation blueprint
              </span>
              . Requirements, architecture, roadmap — and every decision{" "}
              <em>grounded</em> in persistent project state.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="accent" size="lg" id="hero-get-started">
                <Link href="/sign-up">
                  Start building
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" id="hero-sign-in">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>

            {/* Trust signals */}
            <p className="text-xs text-[var(--text-muted)]">
              Free · No credit card · Runs on free-tier infrastructure
            </p>
          </div>

          {/* Right — hub diagram (mirrors og-image center motif) */}
          <div className="relative flex items-center justify-center" aria-hidden="true">
            <HubDiagram />
          </div>
        </div>
      </section>

      {/* ── Feature strip ──────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
            Persistent intelligence, not disposable chat
          </h2>
          <p className="mt-3 text-[var(--text-muted)] max-w-xl mx-auto text-sm md:text-base">
            Generic AI chat gives you a wall of text. ForgeFlow gives you a
            structured project that reasons about itself.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--navy-800)] p-6 transition-colors hover:border-[var(--border-default)] hover:bg-[var(--navy-700)]"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-accent)] bg-[var(--accent-glow)]">
                  <Icon className="h-5 w-5 text-[var(--accent-cyan)]" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                  {f.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-6">
        <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-800)] p-10">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-blue)] to-transparent opacity-50"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Turn your idea into a blueprint
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            One sentence in. Complete architecture, requirements, and roadmap
            out. Under 5 minutes.
          </p>
          <Button
            asChild
            variant="accent"
            size="xl"
            className="mt-6"
            id="bottom-get-started"
          >
            <Link href="/sign-up">
              Get started free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] mt-auto py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-[var(--text-muted)] md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span>
              ForgeFlow AI by{" "}
              <a
                href="https://warishlabs.in"
                className="hover:text-[var(--accent-blue)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                WarishLabs
              </a>
            </span>
          </div>
          <span>Engineering · AI · Impact</span>
        </div>
      </footer>
    </div>
  );
}

// ── Hub diagram component (pure SVG + CSS, no canvas) ─────────────────────
function HubDiagram() {
  const radius = 130;
  const cx = 200;
  const cy = 200;

  return (
    <div className="relative w-full max-w-[400px] aspect-square">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-[var(--accent-blue)] opacity-5 blur-3xl" />

      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full"
        aria-label="ForgeFlow AI hub diagram showing Requirements, Features, Architecture, API Design, Documentation, and Roadmap orbiting a central Project State core"
        role="img"
      >
        {/* Outer orbit ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(26, 111, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r="60"
          stroke="rgba(0, 212, 255, 0.1)"
          strokeWidth="1"
        />

        {/* Connector lines */}
        {HUB_NODES.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const nx = cx + radius * Math.cos(rad);
          const ny = cy + radius * Math.sin(rad);
          return (
            <line
              key={node.label}
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke="rgba(26, 111, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Orbit node dots */}
        {HUB_NODES.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const nx = cx + radius * Math.cos(rad);
          const ny = cy + radius * Math.sin(rad);
          return (
            <g key={node.label}>
              {/* Glow ring */}
              <circle cx={nx} cy={ny} r="14" fill="rgba(26, 111, 255, 0.08)" />
              {/* Node dot */}
              <circle
                cx={nx}
                cy={ny}
                r="8"
                fill="#0d1529"
                stroke="rgba(0, 212, 255, 0.5)"
                strokeWidth="1.5"
              />
              <circle cx={nx} cy={ny} r="3" fill="#00d4ff" opacity="0.8" />
            </g>
          );
        })}

        {/* Center hub — "Project State" */}
        <circle
          cx={cx}
          cy={cy}
          r="40"
          fill="url(#hubGradient)"
          opacity="0.9"
        />
        <circle
          cx={cx}
          cy={cy}
          r="42"
          stroke="rgba(0, 212, 255, 0.4)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Center text */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="#e8f0ff"
          fontSize="7"
          fontWeight="700"
          letterSpacing="1"
          fontFamily="monospace"
        >
          PROJECT
        </text>
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill="#e8f0ff"
          fontSize="7"
          fontWeight="700"
          letterSpacing="1"
          fontFamily="monospace"
        >
          STATE
        </text>
        <text
          x={cx}
          y={cy + 17}
          textAnchor="middle"
          fill="#00d4ff"
          fontSize="5"
          letterSpacing="0.5"
        >
          Persistent
        </text>

        <defs>
          <radialGradient
            id="hubGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#1a6fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#080e1f" stopOpacity="0.9" />
          </radialGradient>
        </defs>
      </svg>

      {/* Node labels positioned around the SVG */}
      {HUB_NODES.map((node) => {
        const rad = (node.angle * Math.PI) / 180;
        // Push labels further out than the SVG nodes
        const labelR = radius + 68;
        const lx = 50 + ((labelR * Math.cos(rad)) / 2);
        const ly = 50 + ((labelR * Math.sin(rad)) / 2);

        return (
          <div
            key={node.label}
            className="absolute text-center pointer-events-none"
            style={{
              left: `${lx}%`,
              top: `${ly}%`,
              transform: "translate(-50%, -50%)",
              width: "80px",
            }}
          >
            <span className="block text-[10px] font-semibold text-[var(--text-primary)] leading-tight tracking-wide uppercase">
              {node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
