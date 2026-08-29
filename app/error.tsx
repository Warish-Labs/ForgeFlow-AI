"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log structured error context for server/client debugging
    console.error("[GlobalError Boundary]", {
      message: error?.message,
      digest: error?.digest,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      location: typeof window !== "undefined" ? window.location.href : "SSR",
    });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#070a14] text-center px-6">
      <div className="flex flex-col items-center gap-6 max-w-md bg-[#0d1220] border border-[#1b2338] p-8 rounded-2xl shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
          <span className="text-2xl" aria-hidden="true">
            ⚠
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-bold text-[#f3f6fc]">
            Something went wrong
          </h1>
          <p className="text-[#9aa4b8] text-xs leading-relaxed">
            An unexpected error occurred while processing your request. The error details have been logged for system diagnosis.
          </p>
          {error.digest && (
            <code className="text-[11px] text-[#38b6ff] bg-[#070a14] border border-[#1b2338] px-2.5 py-1 rounded-lg font-mono">
              Error ID: {error.digest}
            </code>
          )}
        </div>

        <div className="flex gap-3 w-full justify-center pt-2">
          <Button
            variant="accent"
            onClick={reset}
            className="bg-[#1060ee] hover:bg-[#0a2a9c] text-white text-xs px-4 py-2 rounded-xl font-semibold"
          >
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#1b2338] bg-[#070a14] text-[#9aa4b8] hover:text-[#f3f6fc] text-xs px-4 py-2 rounded-xl font-semibold"
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
