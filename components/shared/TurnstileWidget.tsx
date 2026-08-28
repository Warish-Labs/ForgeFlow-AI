"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Turnstile with ssr: false to prevent any SSR / hydration errors
const TurnstileComponent = dynamic(
  () => import("@marsidev/react-turnstile").then((mod) => mod.Turnstile),
  { ssr: false }
);

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  size?: "normal" | "compact";
  className?: string;
}

export function TurnstileWidget({
  onSuccess,
  size = "normal",
  className = "",
}: TurnstileWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAAAAAAAAAAAAAAAAAAAA";

  if (!mounted) {
    return (
      <div className={`h-[65px] w-full flex items-center justify-center text-[10px] text-[#5c6980] border border-[#1b2338] rounded-xl bg-[#070a14] ${className}`}>
        Loading security verification...
      </div>
    );
  }

  return (
    <div className={`flex justify-center py-1 ${className}`}>
      <TurnstileComponent
        siteKey={siteKey}
        onSuccess={onSuccess}
        options={{
          theme: "dark",
          size: size,
        }}
      />
    </div>
  );
}
