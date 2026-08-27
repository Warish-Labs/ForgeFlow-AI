import Image from "next/image";
import Link from "next/link";
import { SparklesIcon, ShieldCheckIcon } from "lucide-react";

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
                alt="ForgeFlow AI Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-mono text-sm font-bold text-[#f3f6fc]">
                FORGEFLOW<span className="text-[#38b6ff]">.AI</span>
              </span>
            </div>
            <p className="max-w-sm text-[#9aa4b8] leading-relaxed">
              Agentic software architecture platform. Transforms raw software vision prompts into structured, reasoned, production-ready project blueprints with persistent state.
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

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#f3f6fc] font-semibold">
              Platform & Features
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-[#38b6ff] transition-colors">
                  About ForgeFlow AI
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-[#38b6ff] transition-colors">
                  System Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-[#38b6ff] transition-colors">
                  Architecture Pipeline
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#38b6ff] transition-colors">
                  Project Workspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#f3f6fc] font-semibold">
              Company & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://warishlabs.in/contact"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#38b6ff] transition-colors font-medium text-[#38b6ff]"
                >
                  Contact Us ↗
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#38b6ff] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#38b6ff] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#38b6ff] transition-colors">
                  Disclaimer Notice
                </Link>
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
            <span className="rounded-full border border-[#1b2338] bg-[#0d1220] px-3 py-1 font-mono text-[10px] text-[#2fe6b0] flex items-center gap-1">
              <ShieldCheckIcon className="h-3 w-3" /> Persistent Project State
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
