"use client";

import { useState } from "react";
import { updateAssumptionsAndQuestionsAction } from "@/lib/actions/edit";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { HelpCircleIcon, CheckCircleIcon, PlusIcon, Trash2Icon, Edit2Icon, CheckIcon, XIcon } from "lucide-react";

export interface QuestionItem {
  id?: string;
  question?: string;
  prompt?: string;
  answer?: string;
  type?: string;
  options?: string[];
  reasoning?: string;
}

interface AssumptionsAndQuestionsProps {
  projectId: string;
  initialAssumptions?: string[];
  initialQuestions?: QuestionItem[];
}

export function AssumptionsAndQuestions({
  projectId,
  initialAssumptions = [],
  initialQuestions = [],
}: AssumptionsAndQuestionsProps) {
  const [assumptions, setAssumptions] = useState<string[]>(initialAssumptions);
  const [newAssumption, setNewAssumption] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const [questions, setQuestions] = useState<QuestionItem[]>(
    initialQuestions.map((q) => ({
      ...q,
      question: q.question || q.prompt || "Technical decision question",
      answer: q.answer || "",
    }))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleAddAssumption() {
    if (!newAssumption.trim()) return;
    const updated = [...assumptions, newAssumption.trim()];
    setAssumptions(updated);
    setNewAssumption("");
    await saveToDb(updated, questions);
  }

  function handleStartEditAssumption(idx: number) {
    setEditingIdx(idx);
    setEditingText(assumptions[idx] || "");
  }

  async function handleSaveEditAssumption(idx: number) {
    if (!editingText.trim()) {
      await handleRemoveAssumption(idx);
      setEditingIdx(null);
      return;
    }
    const updated = [...assumptions];
    updated[idx] = editingText.trim();
    setAssumptions(updated);
    setEditingIdx(null);
    setEditingText("");
    await saveToDb(updated, questions);
  }

  async function handleRemoveAssumption(idx: number) {
    const updated = assumptions.filter((_, i) => i !== idx);
    setAssumptions(updated);
    await saveToDb(updated, questions);
  }

  async function handleAnswerChange(idx: number, answer: string) {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], answer };
    setQuestions(updated);
  }

  async function handleSaveAnswers() {
    await saveToDb(assumptions, questions);
  }

  async function saveToDb(assumpList: string[], qList: QuestionItem[]) {
    setIsSaving(true);
    setFeedback(null);
    const formattedQuestions = qList.map((q) => ({
      question: q.question || q.prompt || "Technical decision question",
      answer: q.answer || "",
    }));
    const res = await updateAssumptionsAndQuestionsAction(projectId, {
      assumptions: assumpList,
      openQuestions: formattedQuestions,
    });
    setIsSaving(false);
    if (res.success) {
      setFeedback("Saved successfully.");
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback("Failed to save.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Assumptions Card */}
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Confirmed Assumptions
            </h3>
            <HelpTooltip
              title="Project Assumptions"
              text="Assumptions detail confirmed architecture choices (e.g. PostgreSQL + Clerk). You can edit or add custom assumptions anytime."
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#38b6ff] bg-[#1060ee]/15 px-2 py-0.5 rounded border border-[#1060ee]/30">
              {assumptions.length} {assumptions.length === 1 ? "assumption" : "assumptions"}
            </span>
            {feedback && <span className="text-xs font-mono text-emerald-400">{feedback}</span>}
          </div>
        </div>

        {assumptions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-2">
            No confirmed assumptions recorded yet. Click Add below to create one.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {assumptions.map((item, idx) => (
              <li
                key={idx}
                className="group flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/60 p-2 text-[var(--text-secondary)]"
              >
                {editingIdx === idx ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 rounded border border-[var(--border-default)] bg-[var(--navy-900)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSaveEditAssumption(idx))}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditAssumption(idx)}
                      className="text-emerald-400 hover:text-emerald-300 p-1"
                      title="Save"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="text-[var(--text-muted)] hover:text-white p-1"
                      title="Cancel"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="leading-relaxed text-[var(--text-primary)] flex-1">• {item}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEditAssumption(idx)}
                        className="text-[var(--text-muted)] hover:text-[#38b6ff] p-1"
                        title="Edit assumption"
                      >
                        <Edit2Icon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveAssumption(idx)}
                        className="text-[var(--text-muted)] hover:text-red-400 p-1"
                        title="Remove assumption"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newAssumption}
            onChange={(e) => setNewAssumption(e.target.value)}
            placeholder="Add new assumption..."
            className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAssumption())}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddAssumption} disabled={isSaving}>
            <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Open Questions Card */}
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircleIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Open Technical Questions
            </h3>
            <HelpTooltip
              title="Open Questions"
              text="Questions identified by AI analysis. Providing answers refines AI Copilot responses and document specs."
            />
          </div>
          {questions.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleSaveAnswers} disabled={isSaving}>
              Save Answers
            </Button>
          )}
        </div>

        {questions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-2">
            No additional technical clarification questions required for this project.
          </p>
        ) : (
          <div className="space-y-3 text-xs">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--navy-800)]/60 p-3 space-y-1.5">
                <p className="font-medium text-[var(--text-primary)]">
                  Q{idx + 1}: {q.question || q.prompt}
                </p>
                {q.reasoning && (
                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    Reasoning: {q.reasoning}
                  </p>
                )}
                <input
                  type="text"
                  value={q.answer || ""}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full rounded border border-[var(--border-default)] bg-[var(--navy-900)] px-2.5 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
