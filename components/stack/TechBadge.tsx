"use client";

import { useState } from "react";
import { TechLogo } from "@/components/stack/TechLogo";

interface TechBadgeProps {
  name: string;
  onRemove?: (name: string) => void;
  interactive?: boolean;
}

const techColorMap: Record<string, { border: string; bg: string; text: string }> = {
  react: { border: "border-[#61dafb]/40", bg: "bg-[#61dafb]/10", text: "text-[#61dafb]" },
  nextjs: { border: "border-[#f3f6fc]/40", bg: "bg-[#131a2c]", text: "text-[#f3f6fc]" },
  typescript: { border: "border-[#3178c6]/40", bg: "bg-[#3178c6]/10", text: "text-[#38b6ff]" },
  nodejs: { border: "border-[#58a65c]/40", bg: "bg-[#58a65c]/10", text: "text-[#2fe6b0]" },
  python: { border: "border-[#3776ab]/40", bg: "bg-[#3776ab]/10", text: "text-[#38b6ff]" },
  postgresql: { border: "border-[#336791]/40", bg: "bg-[#336791]/10", text: "text-[#38b6ff]" },
  redis: { border: "border-[#dc382d]/40", bg: "bg-[#dc382d]/10", text: "text-red-400" },
  tailwindcss: { border: "border-[#38bdf8]/40", bg: "bg-[#38bdf8]/10", text: "text-[#38bdf8]" },
  clerk: { border: "border-[#6c47ff]/40", bg: "bg-[#6c47ff]/10", text: "text-[#a78bfa]" },
  prisma: { border: "border-[#2fe6b0]/40", bg: "bg-[#2fe6b0]/10", text: "text-[#2fe6b0]" },
};

const techDetailsMap: Record<string, { category: string; desc: string }> = {
  nextjs: { category: "Fullstack Framework", desc: "React framework with Server Components & SSR." },
  react: { category: "UI Library", desc: "Declarative component-based user interface engine." },
  typescript: { category: "Language", desc: "Typed JavaScript for type-safe software development." },
  nodejs: { category: "Runtime", desc: "Asynchronous event-driven JavaScript runtime." },
  postgresql: { category: "Relational DB", desc: "ACID-compliant relational database engine." },
  prisma: { category: "ORM Engine", desc: "Next-gen ORM for Node.js & TypeScript." },
  tailwindcss: { category: "CSS Framework", desc: "Utility-first CSS engine for modular design." },
  redis: { category: "In-Memory Store", desc: "Ultra-fast key-value data cache & pub/sub engine." },
  python: { category: "Language / AI", desc: "High-level programming language for ML and backend." },
  docker: { category: "Containerization", desc: "Container platform for consistent app deployment." },
  openai: { category: "LLM Provider", desc: "Generative AI & architectural reasoning models." },
  aws: { category: "Cloud Provider", desc: "Amazon Web Services cloud infrastructure." },
  clerk: { category: "Auth Provider", desc: "User management and authentication infrastructure." },
  vitest: { category: "Test Runner", desc: "Blazing fast unit testing framework." },
  supabase: { category: "BaaS DB", desc: "Open-source Firebase alternative powered by Postgres." },
};

export function TechBadge({ name, onRemove, interactive = true }: TechBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const normKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const colors = techColorMap[normKey] || {
    border: "border-[#1060ee]/40",
    bg: "bg-[#0d1220]",
    text: "text-[#f3f6fc]",
  };
  const details = techDetailsMap[normKey] || {
    category: "Technology Stack",
    desc: `Core dependency module used in project architecture.`,
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => interactive && setShowTooltip(true)}
        onMouseLeave={() => interactive && setShowTooltip(false)}
        onClick={() => interactive && setShowTooltip((prev) => !prev)}
        className={`group inline-flex items-center gap-1.5 rounded-full border ${colors.border} ${colors.bg} px-3 py-1 text-xs font-medium ${colors.text} transition-all hover:scale-105 cursor-pointer shadow-sm`}
      >
        <TechLogo name={name} className="h-3.5 w-3.5 shrink-0" />
        <span className="font-mono text-[11px] font-semibold">{name}</span>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(name);
            }}
            className="ml-0.5 rounded-full p-0.5 text-[#5c6980] hover:bg-red-950 hover:text-red-400"
            title={`Remove ${name}`}
          >
            ×
          </button>
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-[100] mb-2 w-52 -translate-x-1/2 rounded-lg border border-[#1060ee]/50 bg-[#0d1220] p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[#1b2338] pb-1">
            <span className="font-mono text-[10px] font-bold text-[#38b6ff] uppercase tracking-wider">
              {details.category}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#9aa4b8]">
            {details.desc}
          </p>
        </div>
      )}
    </div>
  );
}
