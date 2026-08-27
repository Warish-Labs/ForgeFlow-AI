"use client";

import { useState } from "react";
import { HammerIcon, HelpCircleIcon, XIcon, CheckCircle2Icon } from "lucide-react";

interface ClarificationModalProps {
  isOpen: boolean;
  question: string;
  options?: string[];
  onSubmitAnswer: (answer: string) => void;
  onClose: () => void;
}

export function ClarificationModal({
  isOpen,
  question,
  options,
  onSubmitAnswer,
  onClose,
}: ClarificationModalProps) {
  const [selectedOption, setSelectedOption] = useState("");
  const [customInput, setCustomInput] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalAnswer = selectedOption || customInput.trim();
    if (!finalAnswer) return;

    onSubmitAnswer(finalAnswer);
    setSelectedOption("");
    setCustomInput("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070a14]/80 backdrop-blur-sm p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#1060ee]/50 bg-[#0d1220] p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b2338] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
              <HammerIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f3f6fc]">
                ForgeFlow Agent Clarification Required
              </h3>
              <p className="text-[11px] text-[#9aa4b8]">Agent needs additional context for project state</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1.5 text-[#5c6980] hover:bg-[#131a2c] hover:text-[#f3f6fc]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Question Body */}
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-xl border border-[#38b6ff]/30 bg-[#1060ee]/10 p-4 text-xs text-[#f3f6fc]">
            <HelpCircleIcon className="h-4 w-4 text-[#38b6ff] shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{question}</p>
          </div>

          {/* Preset Options if available */}
          {options && options.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5c6980]">
                Select an Answer:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedOption(opt);
                      setCustomInput("");
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs text-left transition-all ${
                      selectedOption === opt
                        ? "border-[#2fe6b0] bg-[#2fe6b0]/15 font-semibold text-[#2fe6b0]"
                        : "border-[#1b2338] bg-[#070a14] text-[#f3f6fc] hover:border-[#38b6ff]"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedOption === opt && (
                      <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Answer Input */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5c6980]">
              Or type custom response:
            </span>
            <textarea
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setSelectedOption("");
              }}
              placeholder="Provide details to guide ForgeFlow Agent..."
              rows={3}
              className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2338]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1b2338] bg-[#131a2c] px-4 py-2 text-xs font-medium text-[#9aa4b8] hover:text-[#f3f6fc]"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOption && !customInput.trim()}
            className="rounded-xl bg-[#1060ee] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50 shadow-md shadow-blue-500/20"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
}
