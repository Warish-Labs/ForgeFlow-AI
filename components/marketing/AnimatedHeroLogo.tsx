"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function AnimatedHeroLogo() {
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    // Duration of full SVG path animation sequence is ~2.8s
    const timer = setTimeout(() => {
      setAnimationCompleted(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center h-24 w-24">
      {/* ── Phase 1: Animated SVG Logo Sequence ─────────────────────────── */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          animationCompleted ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-20 w-20 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical Main Stem Line */}
          <line
            x1="25"
            y1="15"
            x2="25"
            y2="75"
            stroke="#38b6ff"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-draw-vstem"
          />

          {/* Top Horizontal Branch Line */}
          <line
            x1="25"
            y1="30"
            x2="70"
            y2="30"
            stroke="#1060ee"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-draw-[#1060ee] animate-draw-top-bar"
          />

          {/* Middle Horizontal Branch Line */}
          <line
            x1="25"
            y1="50"
            x2="65"
            y2="50"
            stroke="#38b6ff"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-draw-mid-bar"
          />

          {/* Top Dot Pop */}
          <circle
            cx="70"
            cy="30"
            r="4"
            fill="#38b6ff"
            className="animate-pop-dot-top opacity-0"
          />

          {/* Middle Dot Pop */}
          <circle
            cx="65"
            cy="50"
            r="4"
            fill="#2fe6b0"
            className="animate-pop-dot-mid opacity-0"
          />

          {/* Bottom Accent Underline Line */}
          <line
            x1="15"
            y1="82"
            x2="85"
            y2="82"
            stroke="#2fe6b0"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-draw-underline"
          />
        </svg>

        {/* Embedded Keyframe Definitions for Logo Construction */}
        <style jsx>{`
          .animate-draw-vstem {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: drawLine 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.2s;
          }
          .animate-draw-top-bar {
            stroke-dasharray: 45;
            stroke-dashoffset: 45;
            animation: drawLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.8s;
          }
          .animate-draw-mid-bar {
            stroke-dasharray: 40;
            stroke-dashoffset: 40;
            animation: drawLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 1.2s;
          }
          .animate-pop-dot-top {
            animation: popDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.7s;
          }
          .animate-pop-dot-mid {
            animation: popDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 2.0s;
          }
          .animate-draw-underline {
            stroke-dasharray: 70;
            stroke-dashoffset: 70;
            animation: drawLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 2.3s;
          }

          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes popDot {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            70% {
              transform: scale(1.4);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>

      {/* ── Phase 2: Fixed Official Gradient Logo Mark (Fade In) ────────────── */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
          animationCompleted
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <Image
          src="/Logo/forgeflow-logo-gradient.svg"
          alt="ForgeFlow AI Logo Mark"
          width={80}
          height={80}
          priority
          className="h-20 w-20 drop-shadow-[0_0_30px_rgba(56,182,255,0.5)]"
        />
      </div>
    </div>
  );
}
