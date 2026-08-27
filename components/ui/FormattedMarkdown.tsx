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
            <h1 className="text-sm font-bold text-[var(--color-candlelight-cream,#fff7dd)] mt-3 mb-1.5 pb-1 border-b border-[#fff7dd]/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-[var(--color-champagne-gold,#c8ad86)] mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-[var(--color-candlelight-cream,#fff7dd)] mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 text-[var(--color-candlelight-cream,#fff7dd)]/90 font-normal">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--color-champagne-gold,#c8ad86)]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[var(--color-candlelight-cream,#fff7dd)]/80">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2.5 text-[var(--color-candlelight-cream,#fff7dd)]/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2.5 text-[var(--color-candlelight-cream,#fff7dd)]/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-normal marker:text-[var(--color-champagne-gold,#c8ad86)]">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[#66635f]/30 px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-champagne-gold,#c8ad86)] border border-[#c8ad86]/20">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--color-champagne-gold,#c8ad86)] pl-3 italic my-2 text-[var(--color-candlelight-cream,#fff7dd)]/70">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-champagne-gold,#c8ad86)] underline hover:text-[var(--color-candlelight-cream,#fff7dd)] transition-colors"
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
