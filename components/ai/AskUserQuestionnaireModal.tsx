"use client";

import { useState, useEffect } from "react";
import { QuestionItem, validateQuestionnaireAnswers, AnswerValidationResult } from "@/lib/validations/ai";
import { SparklesIcon, HelpCircleIcon, Loader2Icon, CheckIcon, AlertTriangleIcon, AlertCircleIcon, XIcon, CheckCircle2Icon } from "lucide-react";

export type ModalState =
  | "IDLE"
  | "SELECTING"
  | "VALIDATION_ERROR"
  | "SUBMITTING"
  | "SAVING_ANSWERS"
  | "RESUMING_SYNTHESIS"
  | "SUCCESS"
  | "NEEDS_MORE_INPUT"
  | "FAILURE";

export interface QuestionnaireSubmitResult {
  success: boolean;
  status?: "COMPLETE" | "NEEDS_INPUT";
  questions?: QuestionItem[];
  summary?: {
    functionalCount: number;
    nonFunctionalCount: number;
    featuresCount: number;
    assumptionsCount: number;
    questionsCount: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface AskUserQuestionnaireModalProps {
  isOpen: boolean;
  questions: QuestionItem[];
  onSubmit: (answers: Record<string, any>) => Promise<QuestionnaireSubmitResult>;
  onClose?: () => void;
  questionRound?: number;
}

export function AskUserQuestionnaireModal({
  isOpen,
  questions,
  onSubmit,
  onClose,
  questionRound = 1,
}: AskUserQuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [modalState, setModalState] = useState<ModalState>("IDLE");
  const [validationResult, setValidationResult] = useState<AnswerValidationResult | null>(null);
  const [serverError, setServerError] = useState<{ message: string; saved: boolean } | null>(null);
  const [successSummary, setSuccessSummary] = useState<QuestionnaireSubmitResult["summary"] | null>(null);

  // Initialize initial answer states when questions change
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
      setValidationResult(null);
      setServerError(null);
      setModalState("IDLE");
    }
  }, [questions]);

  if (!isOpen || !questions || questions.length === 0) return null;

  const isProcessing =
    modalState === "SUBMITTING" ||
    modalState === "SAVING_ANSWERS" ||
    modalState === "RESUMING_SYNTHESIS";

  const handleSingleSelect = (questionId: string, option: string) => {
    if (isProcessing) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (modalState === "VALIDATION_ERROR") {
      setValidationResult(null);
    }
    setModalState("SELECTING");
  };

  const handleMultiSelectToggle = (questionId: string, option: string) => {
    if (isProcessing) return;
    setAnswers((prev) => {
      const currentList: string[] = prev[questionId] || [];
      const exists = currentList.includes(option);
      const updated = exists ? currentList.filter((item) => item !== option) : [...currentList, option];
      return { ...prev, [questionId]: updated };
    });
    if (modalState === "VALIDATION_ERROR") {
      setValidationResult(null);
    }
    setModalState("SELECTING");
  };

  const handleTextChange = (questionId: string, val: string) => {
    if (isProcessing) return;
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    if (modalState === "VALIDATION_ERROR") {
      setValidationResult(null);
    }
    setModalState("SELECTING");
  };

  const handleYesNo = (questionId: string, val: boolean) => {
    if (isProcessing) return;
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    if (modalState === "VALIDATION_ERROR") {
      setValidationResult(null);
    }
    setModalState("SELECTING");
  };

  const handleDismiss = () => {
    if (isProcessing) return; // Prevent closing during submission
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Double-click protection

    setServerError(null);

    // Step 1: Client-side Validation
    const validation = validateQuestionnaireAnswers(questions, answers);
    if (!validation.isValid) {
      setValidationResult(validation);
      setModalState("VALIDATION_ERROR");
      return;
    }

    setValidationResult(null);

    // Step 2: Transition through state machine steps
    setModalState("SUBMITTING");

    try {
      setModalState("SAVING_ANSWERS");
      
      // Delay simulation for progress visual feedback if fast
      const res = await onSubmit(answers);

      if (!res.success) {
        setModalState("FAILURE");
        setServerError({
          message: res.error?.message || "Could not resume AI synthesis.",
          saved: false,
        });
        return;
      }

      if (res.status === "NEEDS_INPUT" && res.questions && res.questions.length > 0) {
        setModalState("NEEDS_MORE_INPUT");
        // Reset state for new round of questions
        const nextAnswers: Record<string, any> = {};
        res.questions.forEach((q) => {
          if (q.type === "single_select" && q.options && q.options.length > 0) {
            nextAnswers[q.id] = q.options[0];
          } else if (q.type === "multi_select") {
            nextAnswers[q.id] = [];
          } else if (q.type === "yes_no") {
            nextAnswers[q.id] = true;
          } else if (q.type === "free_text") {
            nextAnswers[q.id] = "";
          }
        });
        setAnswers(nextAnswers);
        setModalState("IDLE");
        return;
      }

      if (res.status === "COMPLETE") {
        setModalState("SUCCESS");
        if (res.summary) {
          setSuccessSummary(res.summary);
        }
        // Small delay to let user see success state before closing
        setTimeout(() => {
          if (onClose) onClose();
        }, 1400);
      }
    } catch (err: any) {
      setModalState("FAILURE");
      setServerError({
        message: err?.message || "An unexpected error occurred while processing answers.",
        saved: false,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          handleDismiss();
        }
      }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] text-[#f3f6fc] shadow-2xl max-h-[85vh] flex flex-col transition-all">
        {/* Top Accent Gradient Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1060ee] via-[#38b6ff] to-[#2fe6b0]" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#1b2338] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#1060ee]/20 border border-[#1060ee]/40 flex items-center justify-center text-[#38b6ff]">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#f3f6fc]">
                  Project Decisions Needed
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-mono font-semibold text-amber-400 animate-pulse">
                ● Waiting on your input (Round {questionRound})
              </span>
              {onClose && !isProcessing && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg p-1.5 text-[#9aa4b8] hover:bg-[#1b2338] hover:text-white transition-colors"
                  title="Close modal"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-[#9aa4b8]">
            ForgeFlow needs a few decisions before it can complete the project analysis and build your architecture blueprint.
          </p>
        </div>

        {/* Questionnaire Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Client-Side Validation Error Banner */}
          {modalState === "VALIDATION_ERROR" && validationResult?.generalError && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-1 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                <span>{validationResult.generalError}</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-300/90 space-y-0.5 pt-1">
                {Object.entries(validationResult.errors).map(([qId, errStr]) => (
                  <li key={qId}>{errStr}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Server Error Banner */}
          {modalState === "FAILURE" && serverError && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-1 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                <span>Could not resume AI synthesis</span>
              </div>
              <p className="text-[11px] text-rose-300/90">
                {serverError.saved
                  ? "Your decisions were saved, but AI synthesis failed. Please try again."
                  : serverError.message || "Your answers were not applied completely. Please check your network connection and try again."}
              </p>
            </div>
          )}

          {/* Top Success Banner */}
          {modalState === "SUCCESS" && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-1 shadow-lg animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2Icon className="h-5 w-5 shrink-0" />
                <span>AI Synthesis Resume Complete!</span>
              </div>
              {successSummary && (
                <p className="text-[11px] text-emerald-300/90 font-mono pt-1">
                  ✓ {successSummary.functionalCount + successSummary.nonFunctionalCount} Requirements saved • {successSummary.featuresCount} Features backlog updated • {successSummary.assumptionsCount} Confirmed assumptions
                </p>
              )}
            </div>
          )}

          {/* Visual Progress Steps during Submission */}
          {isProcessing && (
            <div className="rounded-xl border border-[#1060ee]/30 bg-[#070a14] p-4 space-y-3">
              <div className="text-xs font-semibold text-[#38b6ff] flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin shrink-0 text-[#38b6ff]" />
                <span>Processing Your Decisions</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckIcon className="h-3.5 w-3.5" />
                  <span>Decisions validated & formatted</span>
                </div>
                <div className={`flex items-center gap-2 ${modalState === "SAVING_ANSWERS" || modalState === "RESUMING_SYNTHESIS" ? "text-emerald-400" : "text-[#5c6980]"}`}>
                  {modalState === "SAVING_ANSWERS" ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <CheckIcon className="h-3.5 w-3.5" />}
                  <span>Saving answers to database...</span>
                </div>
                <div className={`flex items-center gap-2 ${modalState === "RESUMING_SYNTHESIS" ? "text-[#38b6ff]" : "text-[#5c6980]"}`}>
                  {modalState === "RESUMING_SYNTHESIS" ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <div className="h-3.5 w-3.5 rounded-full border border-current" />}
                  <span>Resuming AI requirement synthesis graph...</span>
                </div>
              </div>
            </div>
          )}

          {/* Question Cards */}
          {questions.map((q, idx) => {
            const hasError = validationResult?.missingQuestions.includes(q.id);
            const errorMsg = validationResult?.errors[q.id];

            return (
              <div
                key={q.id || idx}
                className={`rounded-xl border p-4 space-y-3 transition-all ${
                  hasError
                    ? "border-rose-500/70 bg-rose-500/5 shadow-md shadow-rose-500/10"
                    : "border-[#1b2338] bg-[#070a14]"
                }`}
              >
                {/* Question title & reasoning */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#f8fafc]">
                      {idx + 1}. {q.prompt}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasError && (
                        <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                          Answer Required
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#5c6980] uppercase">
                        {q.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] text-rose-400 font-medium pt-0.5">
                      ⚠ {errorMsg}
                    </p>
                  )}

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
                          disabled={isProcessing}
                          onClick={() => handleSingleSelect(q.id, opt)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                            isSelected
                              ? "border-[#1060ee] bg-[#1060ee]/20 text-white font-semibold shadow-sm"
                              : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-[#38b6ff]/40 hover:text-[#f3f6fc]"
                          } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
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
                          disabled={isProcessing}
                          onClick={() => handleMultiSelectToggle(q.id, opt)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                            isSelected
                              ? "border-[#1060ee] bg-[#1060ee]/20 text-white font-semibold shadow-sm"
                              : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-[#38b6ff]/40 hover:text-[#f3f6fc]"
                          } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
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
                      disabled={isProcessing}
                      onClick={() => handleYesNo(q.id, true)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        answers[q.id] === true
                          ? "border-[#2fe6b0] bg-[#2fe6b0]/15 text-[#2fe6b0]"
                          : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-[#2fe6b0]/40"
                      } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      Yes, Confirm
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleYesNo(q.id, false)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        answers[q.id] === false
                          ? "border-rose-400 bg-rose-500/15 text-rose-400"
                          : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:border-rose-400/40"
                      } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
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
                      disabled={isProcessing}
                      value={answers[q.id] || ""}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      placeholder="Enter your technical requirement or preference..."
                      className={`w-full rounded-xl border bg-[#0d1220] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none ${
                        hasError ? "border-rose-500/80" : "border-[#1b2338]"
                      } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit Action */}
          <div className="pt-2 border-t border-[#1b2338] flex items-center justify-between">
            <span className="text-[11px] text-[#5c6980]">
              {questions.length} {questions.length === 1 ? "decision" : "decisions"} required
            </span>
            <button
              type="submit"
              disabled={isProcessing || modalState === "SUCCESS"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1060ee] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  {modalState === "SAVING_ANSWERS" ? "Saving decisions..." : "Resuming AI synthesis..."}
                </>
              ) : modalState === "SUCCESS" ? (
                <>
                  <CheckIcon className="h-4 w-4 text-emerald-400" />
                  Complete! Closing...
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
