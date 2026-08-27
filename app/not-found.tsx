// Prevent static prerendering — this page uses ClerkProvider (via root layout)
// which validates the publishable key at build time. Force dynamic rendering.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--navy-950)] text-center px-6">
      <div
        className="absolute inset-0 bg-grid opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md">
        <Logo size="lg" />

        <div className="flex flex-col items-center gap-3">
          <span className="text-8xl font-bold font-mono text-[var(--accent-blue)] opacity-30 select-none">
            404
          </span>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Page not found
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            This page doesn't exist or you may not have access. Let's get you
            back to a working state.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="accent">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
