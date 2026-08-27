"use client";

import { useState, useRef, useEffect } from "react";
import { InfoIcon } from "lucide-react";

interface HelpTooltipProps {
  title?: string;
  text: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function HelpTooltip({ title, text, side = "top", className = "" }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex items-center justify-center text-[#64748b] hover:text-[#38bdf8] focus:text-[#38bdf8] focus:outline-none rounded-full p-0.5 transition-colors"
        aria-label="Information & Help"
      >
        <InfoIcon className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-[100] w-64 rounded-lg border border-[#3b82f6]/40 bg-[#050814] p-3 shadow-2xl backdrop-blur-xl ${positionClasses[side]} text-left transition-all duration-150 animate-in fade-in zoom-in-95`}
        >
          {title && (
            <h4 className="mb-1 text-xs font-semibold text-[#38bdf8]">
              {title}
            </h4>
          )}
          <p className="text-[11px] leading-relaxed text-[#cbd5e1]">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
