"use client";

import ReactMarkdown from "react-markdown";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  return (
    <div className={`prose prose-invert max-w-none text-xs leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm font-bold text-[#f8fafc] mt-3 mb-1.5 pb-1 border-b border-[#3b82f6]/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-[#38bdf8] mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-[#f8fafc] mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 text-[#cbd5e1] font-normal leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#60a5fa]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#cbd5e1]/80">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2.5 text-[#cbd5e1]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2.5 text-[#cbd5e1]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-normal marker:text-[#38bdf8]">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[#1e293b]/70 px-1.5 py-0.5 font-mono text-[11px] text-[#38bdf8] border border-[#3b82f6]/30">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#3b82f6] pl-3 italic my-2 text-[#cbd5e1]/70">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] underline hover:text-[#60a5fa] transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
