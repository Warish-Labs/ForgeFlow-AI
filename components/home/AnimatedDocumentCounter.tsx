"use client";

import { useEffect, useState } from "react";
import { getPublicStatsAction } from "@/lib/actions/publicStats";
import { FileTextIcon } from "lucide-react";

export function AnimatedDocumentCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    getPublicStatsAction().then((stats) => {
      setCount(stats.totalDocuments);
    });
  }, []);

  useEffect(() => {
    if (count === null) return;
    const target = Math.max(count, 12);
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayCount(target);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2fe6b0]/30 bg-[#2fe6b0]/10 text-xs font-mono text-[#2fe6b0] shadow-sm">
      <FileTextIcon className="h-3.5 w-3.5 animate-pulse text-[#2fe6b0]" />
      <span>
        <strong className="text-[#f3f6fc] font-bold">{displayCount.toLocaleString()}</strong> Architecture Blueprints Generated
      </span>
    </div>
  );
}
