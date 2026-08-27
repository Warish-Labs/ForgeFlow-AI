import Image from "next/image";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#1b2338] bg-[#070a14] text-[#9aa4b8] pt-12 pb-8 px-6 text-xs">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & WarishLabs Parent Credit */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image
                src="/Logo/forgeflow-logo-flat.svg"
                alt="ForgeFlow AI"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-mono text-sm font-bold text-[#f3f6fc]">
                FORGEFLOW<span className="text-[#38b6ff]">.AI</span>
              </span>
            </div>
            <p className="max-w-sm text-[#9aa4b8] leading-relaxed">
              Agentic software architecture platform. Transforms raw ideas into structured, reasoned, production-ready project blueprints with persistent state.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#5c6980]">
              <span>Built by</span>
              <a
                href="https://warishlabs.in"
                target="_blank"
                rel="noreferrer"
                className="font-mono font-semibold text-[#38b6ff] hover:underline inline-flex items-center gap-1"
              >
                WarishLabs ↗
              </a>
            </div>
          </div>

          {/* Product Navigation Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#f3f6fc] font-semibold">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-[#38b6ff] transition-colors">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#38b6ff] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#stack" className="hover:text-[#38b6ff] transition-colors">
                  Tech Engine Specs
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#38b6ff] transition-colors">
                  Project Workspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#f3f6fc] font-semibold">
              Resources & Code
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/warishlabs/ForgeFlow-AI"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#38b6ff] transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" /> GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/warishlabs/ForgeFlow-AI#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#38b6ff] transition-colors"
                >
                  Documentation & Architecture
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-[#2fe6b0] font-mono text-[10px]">
                  <SparklesIcon className="h-3 w-3" /> LangGraph.js Powered
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1b2338] pt-6 text-[11px] text-[#5c6980]">
          <div>
            © {new Date().getFullYear()} ForgeFlow AI — Built by WarishLabs. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-[#1b2338] bg-[#0d1220] px-3 py-1 font-mono text-[10px] text-[#2fe6b0]">
              Free to try — no credit card required
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
