"use client";

import { Loader2Icon, SparklesIcon } from "lucide-react";

export default function ProjectPageLoading() {
  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col items-center justify-center p-6 space-y-6">
      {/* Glow Backdrop Accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1060ee]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md">
        {/* Animated Badge Icon */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d1220] border border-[#1060ee]/40 text-[#38b6ff] shadow-2xl shadow-[#1060ee]/30">
          <SparklesIcon className="h-8 w-8 text-[#38b6ff] animate-pulse" />
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#1060ee] flex items-center justify-center border-2 border-[#070a14]">
            <Loader2Icon className="h-3 w-3 animate-spin text-white" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-[#f3f6fc]">
            Loading Project Workspace
          </h2>
          <p className="text-xs text-[#9aa4b8]">
            Retrieving software vision blueprint, AI requirements & architecture topology...
          </p>
        </div>

        {/* Shimmer Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#1b2338] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1060ee] via-[#38b6ff] to-[#2fe6b0] animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
