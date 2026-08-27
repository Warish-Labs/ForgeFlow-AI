"use client";

import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ProposalCard } from "@/components/ai/ProposalCard";
import { ProposalPayload } from "@/lib/actions/ai";

interface FormattedMarkdownProps {
  content: string;
  projectId?: string;
  className?: string;
}

export function FormattedMarkdown({
  content,
  projectId,
  className = "",
}: FormattedMarkdownProps) {
  // Parse any JSON proposal block embedded in the AI response
  let proposalData: ProposalPayload | null = null;
  let markdownContent = content;

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.type && parsed.summary && parsed.targetField) {
        proposalData = parsed as ProposalPayload;
        // Strip the raw json code block so user doesn't see raw json
        markdownContent = content.replace(/```json\s*([\s\S]*?)\s*```/, "").trim();
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return (
    <div className={`prose prose-invert max-w-none text-xs leading-relaxed ${className}`}>
      {markdownContent && (
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-sm font-bold text-[#f3f6fc] mt-3 mb-1.5 pb-1 border-b border-[#1b2338]">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xs font-bold text-[#38b6ff] mt-2.5 mb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-semibold text-[#f3f6fc] mt-2 mb-1">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-2 last:mb-0 text-[#f3f6fc] font-normal leading-relaxed">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-[#38b6ff]">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[#9aa4b8]">
                {children}
              </em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-2.5 text-[#f3f6fc]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-2.5 text-[#f3f6fc]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-normal marker:text-[#38b6ff]">
                {children}
              </li>
            ),
            code: ({ children }) => (
              <code className="rounded bg-[#131a2c] px-1.5 py-0.5 font-mono text-[11px] text-[#38b6ff] border border-[#1b2338]">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-[#1060ee] pl-3 italic my-2 text-[#9aa4b8]">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => {
              if (href && (href.startsWith("/projects/") || href.startsWith("/dashboard"))) {
                return (
                  <Link
                    href={href}
                    className="text-[#38b6ff] underline hover:text-[#1060ee] font-semibold transition-colors inline-flex items-center gap-0.5"
                  >
                    {children}
                  </Link>
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#38b6ff] underline hover:text-[#1060ee] transition-colors"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      )}

      {/* Render Proposal Card if parsed */}
      {proposalData && projectId && (
        <ProposalCard projectId={projectId} proposal={proposalData} />
      )}
    </div>
  );
}
