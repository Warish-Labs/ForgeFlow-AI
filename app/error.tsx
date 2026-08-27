"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--navy-950)] text-center px-6">
      <div className="flex flex-col items-center gap-8 max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-900/30 border border-red-800/50">
          <span className="text-red-400 text-2xl" aria-hidden="true">
            ⚠
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Something went wrong
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            An unexpected error occurred. The error has been logged.
          </p>
          {error.digest && (
            <code className="text-xs text-[var(--text-muted)] bg-[var(--navy-800)] px-2 py-1 rounded font-mono">
              Error ID: {error.digest}
            </code>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="accent" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
