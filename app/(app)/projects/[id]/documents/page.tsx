"use client";

import { useState, useEffect, use } from "react";
import {
  generateDocumentAction,
  updateDocumentContentAction,
  deleteDocumentAction,
  getProjectDocumentsAction,
  DocumentType,
} from "@/lib/actions/document";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import {
  FileTextIcon,
  SparklesIcon,
  Edit3Icon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  Trash2Icon,
  RefreshCwIcon,
} from "lucide-react";

interface DocumentsPageProps {
  params: Promise<{ id: string }>;
}

const DOCUMENT_TYPES: Array<{ type: DocumentType; label: string; description: string }> = [
  { type: "PRD", label: "Product Requirements Document (PRD)", description: "Core vision, problem statement, functional & non-functional requirements." },
  { type: "REQUIREMENTS", label: "Requirements Specification", description: "Detailed functional specifications, scope bounds, and system constraints." },
  { type: "FEATURES", label: "Feature Roadmap & User Stories", description: "Feature inventory categorized by MVP, Phase 2, and Phase 3 releases." },
  { type: "STACK", label: "Technology Stack Guide", description: "Configured frameworks, database layers, ORM, and dependency rationale." },
  { type: "ARCHITECTURE", label: "System Architecture & Topology", description: "Modular component boundaries, API router flow, and data persistence design." },
  { type: "ADRS", label: "Architecture Decision Log (ADRs)", description: "Formal records detailing technical trade-offs and rejected alternatives." },
  { type: "DATABASE", label: "Database Data Model Spec", description: "Entity relationship schema, field specifications, and single-tenant privacy guards." },
  { type: "SECURITY", label: "Security & Authorization Spec", description: "Clerk auth integration, user ownership validation, and Zod output guards." },
  { type: "ROADMAP", label: "Implementation Roadmap", description: "Sequential release milestones and prerequisite task dependency order." },
  { type: "BLUEPRINT", label: "Full Technical Blueprint", description: "Complete compiled project blueprint containing all project specifications." },
];

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id: projectId } = use(params);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [activeEditorDoc, setActiveEditorDoc] = useState<{ id: string; title: string; content: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  async function loadDocuments() {
    const docs = await getProjectDocumentsAction(projectId);
    setDocuments(docs);
  }

  async function handleGenerate(docType: DocumentType) {
    setLoadingType(docType);
    setFeedback(null);
    const res = await generateDocumentAction(projectId, docType);
    setLoadingType(null);
    if (res.success) {
      setFeedback(`Generated document successfully!`);
      await loadDocuments();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback(`Generation failed: ${res.error.message}`);
    }
  }

  async function handleSaveEdit() {
    if (!activeEditorDoc) return;
    setFeedback(null);
    const res = await updateDocumentContentAction(activeEditorDoc.id, activeEditorDoc.content);
    if (res.success) {
      setFeedback("Document updated and saved to database.");
      setActiveEditorDoc(null);
      await loadDocuments();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback(`Save failed: ${res.error.message}`);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document specification?")) return;
    await deleteDocumentAction(docId);
    await loadDocuments();
  }

  function handleCopy(docId: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDownload(title: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Project Document System
            </h2>
            <HelpTooltip
              title="Project Documents"
              text="Generate, edit, version-track, and export individual Markdown specification documents. All changes are saved to PostgreSQL."
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Synthesize formal project documentation specifications from active project state.
          </p>
        </div>
        {feedback && (
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {feedback}
          </span>
        )}
      </div>

      {/* Grid of Document Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map((dt) => {
          const existing = documents.find((d) => d.type === dt.type);
          const isGenerating = loadingType === dt.type;

          return (
            <div
              key={dt.type}
              className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--navy-900)] p-4 shadow-lg space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-[var(--accent-cyan)] shrink-0" />
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">
                      {dt.label}
                    </h3>
                  </div>
                  {existing && (
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="rounded bg-[var(--navy-800)] px-1.5 py-0.5 text-[var(--accent-cyan)] border border-[var(--border-accent)]">
                        v{existing.version}
                      </span>
                      <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-emerald-400 border border-emerald-800/40">
                        {existing.status}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {dt.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                {existing ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveEditorDoc({ id: existing.id, title: dt.label, content: existing.content })}
                    >
                      <Edit3Icon className="h-3 w-3 mr-1" /> Edit / View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(existing.id, existing.content)}
                      title="Copy Markdown"
                    >
                      {copiedId === existing.id ? <CheckIcon className="h-3.5 w-3.5 text-emerald-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(dt.label, existing.content)}
                      title="Download Markdown"
                    >
                      <DownloadIcon className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(existing.id)}
                      title="Delete document"
                    >
                      <Trash2Icon className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-[var(--text-muted)] italic">
                    Not generated yet
                  </span>
                )}

                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleGenerate(dt.type)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCwIcon className="h-3 w-3 mr-1 animate-spin" /> Generating...
                    </>
                  ) : existing ? (
                    <>
                      <RefreshCwIcon className="h-3 w-3 mr-1" /> Re-synthesize
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-3 w-3 mr-1" /> Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Markdown Live Editor & Preview Modal */}
      {activeEditorDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-[var(--border-accent)] bg-[var(--navy-900)] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
                Edit: {activeEditorDoc.title}
              </h3>
              <button
                onClick={() => setActiveEditorDoc(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                value={activeEditorDoc.content}
                onChange={(e) => setActiveEditorDoc({ ...activeEditorDoc, content: e.target.value })}
                className="w-full flex-1 min-h-[350px] rounded-xl border border-[var(--border-default)] bg-[var(--navy-800)] p-4 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(activeEditorDoc.id, activeEditorDoc.content)}
                >
                  <CopyIcon className="h-3.5 w-3.5 mr-1" /> Copy Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(activeEditorDoc.title, activeEditorDoc.content)}
                >
                  <DownloadIcon className="h-3.5 w-3.5 mr-1" /> Export .md
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setActiveEditorDoc(null)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" onClick={handleSaveEdit}>
                  Save Changes to DB
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
