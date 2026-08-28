"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ZapIcon } from "lucide-react";
import { PremiumComingSoonModal } from "@/components/ui/PremiumComingSoonModal";

export function Footer() {
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-[#1b2338] bg-[#070a14] text-[#9aa4b8] pt-12 pb-8 px-6 text-xs">
        <div className="mx-auto max-w-[1200px] space-y-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand Column */}
            <div className="space-y-4 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/Logo/forgeflow-logo-gradient.png"
                  alt="ForgeFlow AI Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(56,182,255,0.4)] group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col">
                  <span className="font-mono text-lg font-bold text-[#f3f6fc] tracking-tight">
                    FORGEFLOW<span className="text-[#38b6ff]">.AI</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#38b6ff]/80 tracking-widest uppercase -mt-1">
                    ENGINEERING BLUEPRINT ENGINE
                  </span>
                </div>
              </Link>
              <p className="text-xs text-[#9aa4b8] max-w-sm leading-relaxed">
                Turn one-line software ideas into structured, reasoned, implementation-ready blueprints with persistent project state and intelligent architecture synthesis.
              </p>
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
                <li>
                  <button
                    onClick={() => setIsPremiumOpen(true)}
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <ZapIcon className="h-3 w-3" />
                    Premium (Coming Soon)
                  </button>
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
                  <Link
                    href="/contact"
                    className="hover:text-[#38b6ff] transition-colors font-medium text-[#38b6ff]"
                  >
                    Contact Us
                  </Link>
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

          {/* Bottom Bar — single WarishLabs line */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1b2338] pt-6 text-[11px] text-[#5c6980]">
            <div>
              © {new Date().getFullYear()} ForgeFlow AI — Built by{" "}
              <a
                href="https://warishlabs.in"
                target="_blank"
                rel="noreferrer"
                className="font-mono font-semibold text-[#38b6ff] hover:underline"
              >
                WarishLabs ↗
              </a>
              . All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[#9aa4b8]">
              <span className="h-2 w-2 rounded-full bg-[#2fe6b0] animate-pulse" />
              <span className="font-mono text-[10px]">System Operational</span>
            </div>
          </div>
        </div>
      </footer>

      <PremiumComingSoonModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
      />
    </>
  );
}
