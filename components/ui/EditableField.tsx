"use client";

import { useState } from "react";
import { Edit2Icon, CheckIcon, XIcon } from "lucide-react";

interface EditableFieldProps {
  initialValue: string;
  onSave: (newValue: string) => Promise<boolean | void>;
  label?: string;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

export function EditableField({
  initialValue,
  onSave,
  label,
  multiline = false,
  placeholder = "Click to add content...",
  className = "",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSave() {
    if (value.trim() === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const success = await onSave(value.trim());
    setIsSaving(false);

    if (success !== false) {
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  }

  function handleCancel() {
    setValue(initialValue);
    setIsEditing(false);
  }

  return (
    <div className={`group relative space-y-1 ${className}`}>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#5c6980] block">
          {label}
        </span>
      )}

      {isEditing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full rounded border border-[#38b6ff] bg-[#070a14] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:outline-none"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded border border-[#38b6ff] bg-[#070a14] px-3 py-1.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:outline-none"
            />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1 rounded bg-[#1060ee] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50"
            >
              <CheckIcon className="h-3 w-3" /> {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-1 rounded border border-[#1b2338] bg-[#131a2c] px-2.5 py-1 text-[11px] text-[#9aa4b8] hover:text-[#f3f6fc] transition-all"
            >
              <XIcon className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer rounded p-2 border border-transparent hover:border-[#1b2338] hover:bg-[#131a2c]/50 transition-all flex items-start justify-between gap-2"
        >
          <div className="text-xs text-[#f3f6fc] leading-relaxed whitespace-pre-wrap flex-1">
            {value || <span className="text-[#5c6980] italic">{placeholder}</span>}
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {savedSuccess && (
              <span className="text-[10px] font-mono text-[#2fe6b0] flex items-center gap-1">
                <CheckIcon className="h-3 w-3" /> Saved
              </span>
            )}
            <span className="rounded p-1 text-[#38b6ff] hover:bg-[#1060ee]/20">
              <Edit2Icon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
