"use client";

import { useState } from "react";
import { getAdminDocumentsAction, deleteDocumentAdminAction } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedMarkdown } from "@/components/ui/FormattedMarkdown";
import { FileTextIcon, SearchIcon, EyeIcon, XIcon, Trash2Icon, Loader2Icon, AlertTriangleIcon } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface AdminDocumentsClientProps {
  documents: Awaited<ReturnType<typeof getAdminDocumentsAction>>;
}

export function AdminDocumentsClient({ documents: initialDocs }: AdminDocumentsClientProps) {
  const [documents, setDocuments] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState<(typeof documents)[number] | null>(null);
  const [deleteDocTarget, setDeleteDocTarget] = useState<(typeof documents)[number] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.projectName.toLowerCase().includes(search.toLowerCase()) ||
      d.ownerId.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const types = Array.from(new Set(documents.map((d) => d.type)));

  async function handleDeleteDocument() {
    if (!deleteDocTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteDocumentAdminAction(deleteDocTarget.id);
      if (res.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDocTarget.id));
        setDeleteDocTarget(null);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-[#2fe6b0]" /> System Documents Registry ({documents.length})
            </CardTitle>
            <p className="text-[11px] text-[#9aa4b8] mt-0.5">
              All generated architecture blueprints and specs across all platform tenants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-[#1b2338] bg-[#070a14] px-3 py-1 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none font-mono"
            >
              <option value="ALL">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="relative w-48">
              <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c6980]" />
              <input
                placeholder="Search doc, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] pl-8 pr-3 py-1 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                <th className="pb-2.5 font-normal">Document Title</th>
                <th className="pb-2.5 font-normal">Type</th>
                <th className="pb-2.5 font-normal">Creator</th>
                <th className="pb-2.5 font-normal">Project</th>
                <th className="pb-2.5 font-normal">Version</th>
                <th className="pb-2.5 font-normal">Status</th>
                <th className="pb-2.5 font-normal">Generated</th>
                <th className="pb-2.5 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#5c6980]">
                    No generated documents match search.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-[#131a2c]/50">
                    <td className="py-2.5 font-medium text-[#f3f6fc]">{d.title}</td>
                    <td className="py-2.5 font-mono text-[11px] text-[#38b6ff]">{d.type}</td>
                    <td className="py-2.5 font-mono text-[11px]">
                      <span
                        title={`User ID: ${d.ownerId}${d.creatorEmail ? ` (${d.creatorEmail})` : ""}`}
                        className="cursor-help text-[#f3f6fc] border-b border-dashed border-[#5c6980]/50 hover:border-[#38b6ff] hover:text-[#38b6ff] transition-colors"
                      >
                        {d.creatorName || "System User"}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{d.projectName}</td>
                    <td className="py-2.5 font-mono text-[11px]">v{d.version}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#2fe6b0]/10 text-[#2fe6b0] border border-[#2fe6b0]/30 text-[10px] font-mono font-semibold">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{d.createdAt}</td>
                    <td className="py-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDoc(d)}
                        className="inline-flex items-center gap-1 rounded bg-[#131a2c] border border-[#1b2338] px-2.5 py-1 text-[11px] text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
                      >
                        <EyeIcon className="h-3 w-3" /> View Spec
                      </button>
                      <button
                        onClick={() => setDeleteDocTarget(d)}
                        className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/30 px-2 py-1 text-[11px] text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="Delete Document Spec"
                      >
                        <Trash2Icon className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Document View Modal */}
      <Dialog.Root open={!!selectedDoc} onOpenChange={(o) => !o && setSelectedDoc(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] border border-[#1060ee]/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
            {selectedDoc && (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[#1b2338]">
                  <div>
                    <span className="text-[10px] font-mono text-[#38b6ff] uppercase">{selectedDoc.type} Spec · v{selectedDoc.version}</span>
                    <Dialog.Title className="text-base font-bold text-[#f3f6fc]">
                      {selectedDoc.title}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close onClick={() => setSelectedDoc(null)} className="rounded p-1 hover:bg-[#1b2338]">
                    <XIcon className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <div className="pt-4">
                  <FormattedMarkdown content={selectedDoc.content} />
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Document Confirmation Dialog */}
      <Dialog.Root open={!!deleteDocTarget} onOpenChange={(o) => !o && setDeleteDocTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border border-rose-500/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <AlertTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-[#f3f6fc]">
                  Confirm Document Deletion
                </Dialog.Title>
                <p className="text-xs text-[#9aa4b8]">
                  Are you sure you want to permanently delete document <strong className="text-[#f3f6fc]">{deleteDocTarget?.title}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteDocTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#1b2338] bg-[#0d1220] text-xs font-semibold text-[#9aa4b8] hover:text-[#f3f6fc]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <Trash2Icon className="h-4 w-4" />}
                Confirm Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
