"use client";

import Image from "next/image";

export function AnimatedHeroLogo() {
  return (
    <div className="relative flex items-center justify-center h-36 w-36 md:h-44 md:w-44">
      {/* Outermost soft glow layer — slow pulse */}
      <div className="absolute inset-[-20px] rounded-full bg-gradient-to-tr from-[#1060ee]/20 via-[#38b6ff]/10 to-[#2fe6b0]/20 blur-3xl animate-pulse pointer-events-none" />

      {/* Rotating ring 1 */}
      <div className="absolute inset-0 rounded-full border border-[#1060ee]/20 animate-spin-slow" style={{ animationDuration: "8s" }} />

      {/* Rotating ring 2 (opposite direction) */}
      <div
        className="absolute inset-2 rounded-full border border-[#38b6ff]/15"
        style={{ animation: "spin 12s linear infinite reverse" }}
      />

      {/* Logo — fades in with scale and glow */}
      <div className="relative z-10 flex items-center justify-center logo-reveal">
        <Image
          src="/Logo/forgeflow-logo-gradient.svg"
          alt="ForgeFlow AI"
          width={120}
          height={120}
          priority
          className="h-28 w-28 md:h-36 md:w-36 drop-shadow-[0_0_40px_rgba(56,182,255,0.65)] transition-transform duration-700 hover:scale-110"
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .logo-reveal {
          animation: logoReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(10px);
            filter: blur(8px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(-2px);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
      `}</style>
    </div>
  );
}
