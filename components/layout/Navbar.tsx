"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { LayoutDashboardIcon, ArrowRightIcon, ZapIcon } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { PremiumComingSoonModal } from "@/components/ui/PremiumComingSoonModal";

export function Navbar() {
  let userId: string | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = useAuth();
    userId = auth.userId ?? null;
  } catch {
    userId = null;
  }

  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1b2338] bg-[#070a14]/90 backdrop-blur-md px-6 py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-5 text-xs font-medium text-[#9aa4b8]">
            <Link href="/about" className="hover:text-[#38b6ff] transition-colors hidden md:block">
              About Us
            </Link>
            <a href="/#features" className="hover:text-[#38b6ff] transition-colors hidden md:block">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-[#38b6ff] transition-colors hidden md:block">
              How It Works
            </a>
            
            {/* Standard unhighlighted Contact link pointing to ForgeFlow contact form */}
            <Link
              href="/contact"
              className="hover:text-[#38b6ff] transition-colors hidden md:block"
            >
              Contact Us
            </Link>

            {/* Premium Banner Button */}
            <button
              onClick={() => setIsPremiumOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-400/20 transition-all shadow-sm"
            >
              <ZapIcon className="h-3.5 w-3.5" />
              Buy Premium
            </button>

            {userId ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded border border-[#1060ee] bg-[#0d1220] px-3.5 py-1.5 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all shadow-sm"
                >
                  <LayoutDashboardIcon className="h-3.5 w-3.5" /> Workspace
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/sign-in"
                  className="hover:text-[#38b6ff] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1 rounded bg-[#1060ee] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shadow-md shadow-blue-500/20"
                >
                  Start Free <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <PremiumComingSoonModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
      />
    </>
  );
}
