"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth, UserButton } from "@clerk/nextjs";
import { LayoutDashboardIcon, ArrowRightIcon } from "lucide-react";

export function Navbar() {
  const { userId } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1b2338] bg-[#070a14]/90 backdrop-blur-md px-6 py-3.5">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/Logo/forgeflow-logo-flat.svg"
            alt="ForgeFlow AI Logo"
            width={28}
            height={28}
            className="h-7 w-7 transition-transform group-hover:scale-105"
          />
          <span className="font-mono text-sm font-bold tracking-tight text-[#f3f6fc]">
            FORGEFLOW<span className="text-[#38b6ff]">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-6 text-xs font-medium text-[#9aa4b8]">
          <Link href="/about" className="hover:text-[#38b6ff] transition-colors">
            About Us
          </Link>
          <a href="/#features" className="hover:text-[#38b6ff] transition-colors">
            Platform Features
          </a>
          <a href="/#how-it-works" className="hover:text-[#38b6ff] transition-colors">
            How It Works
          </a>
          <a
            href="https://warishlabs.in/contact"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#38b6ff] transition-colors text-[#38b6ff]"
          >
            Contact ↗
          </a>

          {userId ? (
            <div className="flex items-center gap-4">
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
  );
}
