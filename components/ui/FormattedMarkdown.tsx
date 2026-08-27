"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ProposalCard } from "@/components/ai/ProposalCard";
import { ClarificationModal } from "@/components/ai/ClarificationModal";
import { ProposalPayload } from "@/lib/actions/ai";

interface FormattedMarkdownProps {
  content: string;
  projectId?: string;
  className?: string;
  onSendClarificationAnswer?: (answer: string) => void;
}

export function FormattedMarkdown({
  content,
  projectId,
  className = "",
  onSendClarificationAnswer,
}: FormattedMarkdownProps) {
  // Parse any JSON proposal block embedded in the AI response
  let proposalData: ProposalPayload | null = null;
  let clarificationData: { question: string; options?: string[] } | null = null;
  let markdownContent = content;

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.type === "CLARIFICATION_NEEDED" && parsed.question) {
        clarificationData = { question: parsed.question, options: parsed.options };
        markdownContent = content.replace(/```json\s*([\s\S]*?)\s*```/, "").trim();
      } else if (parsed.type && parsed.summary && parsed.targetField) {
        proposalData = parsed as ProposalPayload;
        markdownContent = content.replace(/```json\s*([\s\S]*?)\s*```/, "").trim();
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  const [isClarificationOpen, setIsClarificationOpen] = useState(false);

  useEffect(() => {
    if (clarificationData) {
      setIsClarificationOpen(true);
    }
  }, [content]);

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

      {/* Render Clarification Pop-Up Modal if triggered */}
      {clarificationData && (
        <ClarificationModal
          isOpen={isClarificationOpen}
          question={clarificationData.question}
          options={clarificationData.options}
          onClose={() => setIsClarificationOpen(false)}
          onSubmitAnswer={(answer) => {
            if (onSendClarificationAnswer) {
              onSendClarificationAnswer(answer);
            }
          }}
        />
      )}
    </div>
  );
}
