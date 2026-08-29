"use client";

import { useState, useEffect } from "react";
import { QuestionItem } from "@/lib/validations/ai";
import { SparklesIcon, HelpCircleIcon, Loader2Icon, CheckIcon, XIcon } from "lucide-react";

interface AskUserQuestionnaireModalProps {
  isOpen: boolean;
  questions: QuestionItem[];
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
}

export function AskUserQuestionnaireModal({
  isOpen,
  questions,
  onSubmit,
  isSubmitting = false,
}: AskUserQuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (questions && questions.length > 0) {
      const initial: Record<string, any> = {};
      questions.forEach((q) => {
        if (q.type === "single_select" && q.options && q.options.length > 0) {
          initial[q.id] = q.options[0];
        } else if (q.type === "multi_select") {
          initial[q.id] = [];
        } else if (q.type === "yes_no") {
          initial[q.id] = true;
        } else if (q.type === "free_text") {
          initial[q.id] = "";
        }
      });
      setAnswers(initial);
    }
  }, [questions]);

  if (!isOpen || !questions || questions.length === 0) return null;

  const handleSingleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleMultiSelectToggle = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const currentList: string[] = prev[questionId] || [];
      const exists = currentList.includes(option);
      const updated = exists ? currentList.filter((item) => item !== option) : [...currentList, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleTextChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleYesNo = (questionId: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    for (const q of questions) {
      if (q.type === "free_text" && (!answers[q.id] || !answers[q.id].trim())) {
        setValidationError(`Please provide an answer for "${q.prompt}"`);
        return;
      }
      if (q.type === "multi_select" && (!answers[q.id] || answers[q.id].length === 0)) {
        setValidationError(`Please select at least one option for "${q.prompt}"`);
        return;
      }
    }

    await onSubmit(answers);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] text-[#f3f6fc] shadow-2xl max-h-[85vh] flex flex-col">
        {/* Top Accent Gradient Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1060ee] via-[#38b6ff] to-[#2fe6b0]" />

        {/* Header */}
        <div className="p-6 pb-3 border-b border-[#1b2338] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#1060ee]/20 border border-[#1060ee]/40 flex items-center justify-center text-[#38b6ff]">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-[#f3f6fc]">
                AI Tech-Stack Decision Required
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-mono font-semibold text-amber-400 animate-pulse">
              ● Waiting on your input
            </span>
          </div>
          <p className="text-xs text-[#9aa4b8]">
            The AI Architecture Agent paused generation because key technical choices are missing or ambiguous. Select your preferences to resume blueprint synthesis.
          </p>
        </div>

        {/* Questionnaire Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-400 font-medium">
              {validationError}
            </div>
          )}

          {questions.map((q, idx) => (
            <div key={q.id || idx} className="rounded-xl border border-[#1b2338] bg-[#070a14] p-4 space-y-3">
              {/* Question title & reasoning */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#f3f6fc]">
                    {idx + 1}. {q.prompt}
                  </h4>
                  <span className="text-[10px] font-mono text-[#5c6980] uppercase">{q.type.replace("_", " ")}</span>
                </div>
                {q.reasoning && (
                  <div className="flex items-start gap-1.5 text-[11px] text-[#9aa4b8] bg-[#131a2c]/60 p-2.5 rounded-lg border border-[#1b2338]">
                    <HelpCircleIcon className="h-3.5 w-3.5 text-[#38b6ff] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#38b6ff]">AI Rationale:</strong> {q.reasoning}
                    </span>
                  </div>
                )}
              </div>

              {/* Single Select Options */}
              {q.type === "single_select" && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSingleSelect(q.id, opt)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                          isSelected
                            ? "border-[#1060ee] bg-[#1060ee]/15 text-white font-semibold shadow-sm"
                            : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-[#38b6ff]/40 hover:text-[#f3f6fc]"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckIcon className="h-4 w-4 text-[#38b6ff]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi Select Options */}
              {q.type === "multi_select" && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const selectedList: string[] = answers[q.id] || [];
                    const isSelected = selectedList.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleMultiSelectToggle(q.id, opt)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                          isSelected
                            ? "border-[#1060ee] bg-[#1060ee]/15 text-white font-semibold shadow-sm"
                            : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-[#38b6ff]/40 hover:text-[#f3f6fc]"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckIcon className="h-4 w-4 text-[#38b6ff]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Yes / No Toggle */}
              {q.type === "yes_no" && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleYesNo(q.id, true)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      answers[q.id] === true
                        ? "border-[#2fe6b0] bg-[#2fe6b0]/15 text-[#2fe6b0]"
                        : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-[#2fe6b0]/40"
                    }`}
                  >
                    Yes, Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYesNo(q.id, false)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      answers[q.id] === false
                        ? "border-rose-400 bg-rose-500/15 text-rose-400"
                        : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-rose-400/40"
                    }`}
                  >
                    No, Skip
                  </button>
                </div>
              )}

              {/* Free Text Input */}
              {q.type === "free_text" && (
                <div className="pt-1">
                  <textarea
                    rows={2}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Enter your technical requirement or preference..."
                    className="w-full rounded-xl border border-[#1b2338] bg-[#0d1220] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Submit Action */}
          <div className="pt-2 border-t border-[#1b2338] flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1060ee] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Resuming AI Synthesis...
                </>
              ) : (
                <>
                  Submit Selections & Resume AI Synthesis →
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
