"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";

interface HelpTooltipProps {
  title?: string;
  text: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function HelpTooltip({ title, text, side = "top", className = "" }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-cyan)] focus:text-[var(--accent-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] rounded-full p-0.5 transition-colors"
        aria-label="Information & Help"
      >
        <InfoIcon className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 rounded-xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-3 shadow-xl backdrop-blur-md ${positionClasses[side]} text-left pointer-events-none transition-all duration-150`}
        >
          {title && (
            <h4 className="mb-1 text-xs font-semibold text-[var(--accent-cyan)]">
              {title}
            </h4>
          )}
          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
