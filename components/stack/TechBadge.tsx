"use client";

import { useState } from "react";
import { TechLogo } from "@/components/stack/TechLogo";

interface TechBadgeProps {
  name: string;
  onRemove?: (name: string) => void;
  interactive?: boolean;
}

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
  openai: { category: "LLM Provider", desc: "State-of-the-art generative AI & embedding models." },
  aws: { category: "Cloud Provider", desc: "Amazon Web Services cloud infrastructure." },
  clerk: { category: "Auth Provider", desc: "User management and authentication infrastructure." },
  vitest: { category: "Test Runner", desc: "Blazing fast Vite-native unit testing framework." },
  supabase: { category: "BaaS DB", desc: "Open-source Firebase alternative powered by Postgres." },
};

export function TechBadge({ name, onRemove, interactive = true }: TechBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const normKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const details = techDetailsMap[normKey] || {
    category: "Technology Stack",
    desc: `Core dependency module used in project architecture.`,
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => interactive && setShowTooltip(true)}
        onMouseLeave={() => interactive && setShowTooltip(false)}
        className="group inline-flex items-center gap-1.5 rounded-[100px] border border-[#c8ad86]/40 bg-[#0a0a0a] px-2.5 py-1 text-xs font-medium text-[#fff7dd] transition-all hover:border-[#c8ad86] hover:bg-[#121212]"
      >
        <TechLogo name={name} className="h-3.5 w-3.5 shrink-0" />
        <span className="font-mono text-[11px] text-[#fff7dd]">{name}</span>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(name);
            }}
            className="ml-0.5 rounded-full p-0.5 text-[#66635f] hover:bg-[#66635f]/30 hover:text-red-400"
            title={`Remove ${name}`}
          >
            ×
          </button>
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded border border-[#c8ad86]/40 bg-[#0a0a0a] p-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#fff7dd]/15 pb-1">
            <span className="font-mono text-[10px] font-bold text-[#c8ad86] uppercase tracking-wider">
              {details.category}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#fff7dd]/80">
            {details.desc}
          </p>
        </div>
      )}
    </div>
  );
}
