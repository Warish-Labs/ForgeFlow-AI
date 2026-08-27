"use client";

import { useState } from "react";
import { updateProjectMetadataAction } from "@/lib/actions/edit";
import { Edit2Icon, CheckIcon, XIcon, SparklesIcon } from "lucide-react";

interface EditableSoftwareVisionProps {
  projectId: string;
  initialIdeaText: string;
  initialProblemStatement: string;
}

export function EditableSoftwareVision({
  projectId,
  initialIdeaText,
  initialProblemStatement,
}: EditableSoftwareVisionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [ideaText, setIdeaText] = useState(initialIdeaText);
  const [problemStatement, setProblemStatement] = useState(initialProblemStatement);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSave() {
    if (!ideaText.trim() || isSaving) return;
    setIsSaving(true);
    const res = await updateProjectMetadataAction(projectId, {
      ideaText: ideaText.trim(),
      problemStatement: problemStatement.trim(),
    });
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } else {
      alert(res.error.message);
    }
  }

  return (
    <div className="rounded-xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-4 shadow-xl transition-all hover:border-[#1060ee]/40">
      <div className="flex items-center justify-between border-b border-[#1b2338] pb-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-[#38b6ff]" />
          <h3 className="text-sm font-bold text-[#f3f6fc]">
            Software Vision & Problem Statement
          </h3>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1b2338] bg-[#131a2c] px-3 py-1.5 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
            title="Edit Software Vision & Problem Statement"
          >
            <Edit2Icon className="h-3.5 w-3.5" />
            Edit Vision
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1060ee] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setIdeaText(initialIdeaText);
                setProblemStatement(initialProblemStatement);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1b2338] bg-[#131a2c] px-2.5 py-1.5 text-xs font-medium text-[#9aa4b8] hover:text-[#f3f6fc]"
            >
              <XIcon className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="rounded-lg bg-[#2fe6b0]/10 border border-[#2fe6b0]/40 p-2.5 text-xs text-[#2fe6b0] font-semibold">
          ✓ Vision and problem statement updated successfully!
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-mono text-[#38b6ff] uppercase tracking-wider mb-1 font-semibold">
              Software Vision Prompt
            </h4>
            <p className="text-xs text-[#f3f6fc] leading-relaxed whitespace-pre-wrap">
              {ideaText}
            </p>
          </div>

          {problemStatement && (
            <div className="pt-3 border-t border-[#1b2338]">
              <h4 className="text-[10px] font-mono text-[#38b6ff] uppercase tracking-wider mb-1 font-semibold">
                Problem Statement
              </h4>
              <p className="text-xs text-[#9aa4b8] leading-relaxed">
                {problemStatement}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#f3f6fc] block mb-1.5">
              Software Vision Prompt
            </label>
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#f3f6fc] block mb-1.5">
              Problem Statement (Optional)
            </label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
