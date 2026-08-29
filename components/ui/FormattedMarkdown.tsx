"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ProposalCard } from "@/components/ai/ProposalCard";
import { ClarificationModal } from "@/components/ai/ClarificationModal";
import { ProposalPayload } from "@/lib/actions/ai";
import { InfoIcon, LightbulbIcon, AlertTriangleIcon, ShieldAlertIcon, CheckCircle2Icon } from "lucide-react";

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
              <h1 className="text-base font-bold text-[#f3f6fc] mt-4 mb-2 pb-1 border-b border-[#1b2338] flex items-center gap-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold text-[#38b6ff] mt-3 mb-1.5 flex items-center gap-1.5">
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
              <code className="rounded bg-[#131a2c] px-1.5 py-0.5 font-mono text-[11px] text-[#2fe6b0] border border-[#1b2338]">
                {children}
              </code>
            ),
            blockquote: ({ children }) => {
              const textContent = React.Children.toArray(children)
                .map((child: any) => child?.props?.children || child)
                .join("")
                .trim();

              if (textContent.startsWith("[!NOTE]")) {
                return (
                  <div className="my-3 rounded-xl border border-[#1060ee]/40 bg-[#1060ee]/10 p-3 text-xs text-[#38b6ff] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[10px]">
                      <InfoIcon className="h-3.5 w-3.5" /> Note
                    </div>
                    <div>{textContent.replace("[!NOTE]", "").trim()}</div>
                  </div>
                );
              }
              if (textContent.startsWith("[!TIP]")) {
                return (
                  <div className="my-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[10px]">
                      <LightbulbIcon className="h-3.5 w-3.5" /> Tip
                    </div>
                    <div>{textContent.replace("[!TIP]", "").trim()}</div>
                  </div>
                );
              }
              if (textContent.startsWith("[!WARNING]")) {
                return (
                  <div className="my-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[10px]">
                      <AlertTriangleIcon className="h-3.5 w-3.5" /> Warning
                    </div>
                    <div>{textContent.replace("[!WARNING]", "").trim()}</div>
                  </div>
                );
              }
              if (textContent.startsWith("[!IMPORTANT]")) {
                return (
                  <div className="my-3 rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 text-xs text-purple-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[10px]">
                      <CheckCircle2Icon className="h-3.5 w-3.5" /> Important
                    </div>
                    <div>{textContent.replace("[!IMPORTANT]", "").trim()}</div>
                  </div>
                );
              }
              if (textContent.startsWith("[!CAUTION]")) {
                return (
                  <div className="my-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[10px]">
                      <ShieldAlertIcon className="h-3.5 w-3.5" /> Caution
                    </div>
                    <div>{textContent.replace("[!CAUTION]", "").trim()}</div>
                  </div>
                );
              }

              return (
                <blockquote className="border-l-2 border-[#1060ee] pl-3 italic my-2 text-[#9aa4b8] bg-[#070a14] py-1 rounded-r">
                  {children}
                </blockquote>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-xl border border-[#1b2338]">
                <table className="w-full text-left text-xs border-collapse">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#070a14] border-b border-[#1b2338] text-[#38b6ff] font-mono text-[11px]">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-[#131a2c]/50">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="p-2.5 font-semibold text-[11px]">{children}</th>
            ),
            td: ({ children }) => (
              <td className="p-2.5 leading-relaxed">{children}</td>
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
