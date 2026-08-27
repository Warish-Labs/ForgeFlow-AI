"use client";

import { useState } from "react";
import { updateRequirementsAction } from "@/lib/actions/edit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import {
  CheckCircle2Icon,
  ShieldCheckIcon,
  PlusIcon,
  Trash2Icon,
  Edit2Icon,
  CheckIcon,
  XIcon,
} from "lucide-react";

interface EditableRequirementsListProps {
  projectId: string;
  initialFunctional: string[];
  initialNonFunctional: string[];
}

export function EditableRequirementsList({
  projectId,
  initialFunctional,
  initialNonFunctional,
}: EditableRequirementsListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [functional, setFunctional] = useState<string[]>(initialFunctional);
  const [nonFunctional, setNonFunctional] = useState<string[]>(initialNonFunctional);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const cleanedFunc = functional.filter((f) => f.trim().length > 0);
    const cleanedNonFunc = nonFunctional.filter((f) => f.trim().length > 0);

    const res = await updateRequirementsAction(projectId, {
      functional: cleanedFunc,
      nonFunctional: cleanedNonFunc,
    });
    setIsSaving(false);
    if (res.success) {
      setFunctional(cleanedFunc);
      setNonFunctional(cleanedNonFunc);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } else {
      alert(res.error.message);
    }
  }

  function handleAddFunctional() {
    setFunctional([...functional, ""]);
  }

  function handleAddNonFunctional() {
    setNonFunctional([...nonFunctional, ""]);
  }

  function handleRemoveFunctional(index: number) {
    setFunctional(functional.filter((_, i) => i !== index));
  }

  function handleRemoveNonFunctional(index: number) {
    setNonFunctional(nonFunctional.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1b2338] pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#38b6ff]">
          System Requirements Specifications
        </h3>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1b2338] bg-[#131a2c] px-3 py-1.5 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
          >
            <Edit2Icon className="h-3.5 w-3.5" />
            Edit Requirements
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1060ee] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save All Requirements"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFunctional(initialFunctional);
                setNonFunctional(initialNonFunctional);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[#1b2338] bg-[#131a2c] px-2.5 py-1.5 text-xs font-medium text-[#9aa4b8] hover:text-[#f3f6fc]"
            >
              <XIcon className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="rounded-lg bg-[#2fe6b0]/10 border border-[#2fe6b0]/40 p-2.5 text-xs text-[#2fe6b0] font-semibold">
          ✓ Requirements updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Functional Requirements Card */}
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0]" /> Functional Requirements
            </CardTitle>
            <HelpTooltip
              title="Functional Requirements"
              text="Explicit capabilities and behavioral features the system must provide."
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {functional.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-[#38b6ff] text-xs font-bold shrink-0 w-7">
                  F{idx + 1}.
                </span>
                {!isEditing ? (
                  <div className="flex-1 rounded-lg border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] leading-relaxed">
                    {req}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const updated = [...functional];
                        updated[idx] = e.target.value;
                        setFunctional(updated);
                      }}
                      className="flex-1 rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-2 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
                    />
                    <button
                      onClick={() => handleRemoveFunctional(idx)}
                      className="rounded p-1.5 text-red-400 hover:bg-red-950/40"
                      title="Remove Requirement"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                onClick={handleAddFunctional}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1060ee]/40 bg-[#131a2c] py-2 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add Functional Requirement
              </button>
            )}
          </CardContent>
        </Card>

        {/* Non-Functional Requirements Card */}
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-[#38b6ff]" /> Non-Functional Requirements
            </CardTitle>
            <HelpTooltip
              title="Non-Functional Requirements"
              text="Quality constraints including latency, security, scalability, and uptime."
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {nonFunctional.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-[#1060ee] text-xs font-bold shrink-0 w-9">
                  NFR{idx + 1}.
                </span>
                {!isEditing ? (
                  <div className="flex-1 rounded-lg border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] leading-relaxed">
                    {req}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const updated = [...nonFunctional];
                        updated[idx] = e.target.value;
                        setNonFunctional(updated);
                      }}
                      className="flex-1 rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-2 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
                    />
                    <button
                      onClick={() => handleRemoveNonFunctional(idx)}
                      className="rounded p-1.5 text-red-400 hover:bg-red-950/40"
                      title="Remove Requirement"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                onClick={handleAddNonFunctional}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1060ee]/40 bg-[#131a2c] py-2 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add Non-Functional Requirement
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
