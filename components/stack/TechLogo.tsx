"use client";

import React from "react";
import { CpuIcon } from "lucide-react";

interface TechLogoProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Returns clean SVG brand logo paths for major developer technologies
 */
export function TechLogo({ name, className = "h-4 w-4", size = 16 }: TechLogoProps) {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (norm.includes("next")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 180 180" fill="none">
        <circle cx="90" cy="90" r="90" fill="#000" />
        <path d="M149.508 157.52L69.142 54H54V126H67.8844V71.6219L137.915 162.247C142.062 160.852 145.94 159.261 149.508 157.52Z" fill="url(#paint0_linear_next)" />
        <path d="M115 54H128.5V126H115V54Z" fill="url(#paint1_linear_next)" />
        <defs>
          <linearGradient id="paint0_linear_next" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7DD" />
            <stop offset="1" stopColor="#C8AD86" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="paint1_linear_next" x1="121.75" y1="54" x2="121.75" y2="106" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7DD" />
            <stop offset="1" stopColor="#C8AD86" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes("react")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#00d4ff" strokeWidth="6" />
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#00d4ff" strokeWidth="6" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#00d4ff" strokeWidth="6" transform="rotate(120 50 50)" />
        <circle cx="50" cy="50" r="7" fill="#00d4ff" />
      </svg>
    );
  }

  if (norm.includes("typescript") || norm === "ts") {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100">
        <rect width="100" height="100" rx="16" fill="#3178C6" />
        <path d="M57 66h16M65 42v24M28 50c3 1 7 3 11 3 4 0 6-2 6-5 0-8-15-5-15-16 0-7 6-12 15-12 5 0 10 2 13 4M42 20v-2" stroke="#FFF7DD" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (norm.includes("python")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100">
        <path d="M48 10c-18 0-18 8-18 8v9h18v3H24s-9 0-9 17 8 18 8 18h5v-7c0-9 8-9 8-9h16s8 0 8-8V26s0-16-16-16zm-7 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="#3776AB" />
        <path d="M52 90c18 0 18-8 18-8v-9H52v-3h24s9 0 9-17-8-18-8-18h-5v7c0 9-8 9-8 9H48s-8 0-8 8v15s0 16 16 16zm7-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="#FFD43B" />
      </svg>
    );
  }

  if (norm.includes("postgres") || norm.includes("psql")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 12c-20 0-35 15-35 35 0 25 25 41 35 41s35-16 35-41c0-20-15-35-35-35z" fill="#336791" />
        <path d="M38 40c4-6 12-8 20-5 6 2 10 7 12 13M35 55c5 5 15 7 24 2" stroke="#FFF7DD" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm.includes("prisma")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100">
        <path d="M22 78L46 16L78 68L22 78Z" fill="#2D3748" stroke="#5A67D8" strokeWidth="6" strokeLinejoin="round" />
        <path d="M46 16L78 68L56 82L46 16Z" fill="#5A67D8" />
      </svg>
    );
  }

  if (norm.includes("tailwind")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M20 50c5-10 12-15 20-15 12 0 15 10 23 10 5 0 10-3 14-10-5 10-12 15-20 15-12 0-15-10-23-10-5 0-10 3-14 10z" fill="#38BDF8" />
        <path d="M10 70c5-10 12-15 20-15 12 0 15 10 23 10 5 0 10-3 14-10-5 10-12 15-20 15-12 0-15-10-23-10-5 0-10 3-14 10z" fill="#38BDF8" />
      </svg>
    );
  }

  if (norm.includes("redis")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M15 35l35-15 35 15-35 15-35-15z" fill="#DC382D" />
        <path d="M15 50l35 15 35-15-35 15-35-15z" fill="#A41E11" />
        <path d="M15 65l35 15 35-15-35 15-35-15z" fill="#7A1009" />
      </svg>
    );
  }

  if (norm.includes("docker")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect x="20" y="45" width="12" height="10" fill="#2496ED" rx="2" />
        <rect x="35" y="45" width="12" height="10" fill="#2496ED" rx="2" />
        <rect x="50" y="45" width="12" height="10" fill="#2496ED" rx="2" />
        <rect x="35" y="32" width="12" height="10" fill="#2496ED" rx="2" />
        <rect x="50" y="32" width="12" height="10" fill="#2496ED" rx="2" />
        <path d="M10 60c5 15 25 20 45 20 25 0 35-10 35-10s-5-5-10-5H10z" fill="#2496ED" />
      </svg>
    );
  }

  if (norm.includes("node")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100">
        <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" fill="#339933" />
        <path d="M50 10L85 30V70L50 50V10Z" fill="#43853D" />
      </svg>
    );
  }

  if (norm.includes("openai") || norm.includes("gpt")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M48 18a14 14 0 0 1 24 5l2-1a14 14 0 0 1 18 16v3a14 14 0 0 1-6 24l-2 1a14 14 0 0 1-18 16v-3a14 14 0 0 1-18-16v-3a14 14 0 0 1-6-24l2-1a14 14 0 0 1 18-16zm4 18l-12 21h24l-12-21z" stroke="#C8AD86" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm.includes("aws") || norm.includes("amazon")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M20 65c15 12 45 15 60 0M72 60l8 5-4-8" stroke="#FF9900" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="18" y="48" fill="#FFF7DD" fontSize="26" fontWeight="bold" fontFamily="sans-serif">aws</text>
      </svg>
    );
  }

  if (norm.includes("clerk")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M20 30h60v40H20z" fill="#6C47FF" rx="8" />
        <circle cx="50" cy="45" r="10" fill="#FFF7DD" />
        <path d="M35 65c0-8 7-12 15-12s15 4 15 12" stroke="#FFF7DD" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm.includes("vitest") || norm.includes("vite")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M15 20L50 85L85 20L50 35L15 20Z" fill="url(#paint0_vite)" />
        <path d="M35 20L50 50L65 20" stroke="#729B1B" strokeWidth="6" strokeLinecap="round" />
        <defs>
          <linearGradient id="paint0_vite" x1="15" y1="20" x2="85" y2="85">
            <stop stopColor="#FCC72B" />
            <stop offset="1" stopColor="#729B1B" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes("supabase")) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M55 10L15 58h32L35 90l48-48H52L55 10z" fill="#3ECF8E" />
      </svg>
    );
  }

  // Fallback icon for any tech name
  return <CpuIcon className={`${className} text-[#38bdf8]`} />;
}
