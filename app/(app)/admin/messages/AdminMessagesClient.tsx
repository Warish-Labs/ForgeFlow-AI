"use client";

import { useState } from "react";
import {
  ContactMessageWithReplies,
  markMessageReadAction,
  toggleMessageReadAction,
  softDeleteMessageAction,
  sendContactReplyAction,
} from "@/lib/actions/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquareIcon, SearchIcon, MailIcon, SendIcon,
  ArchiveIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon,
  UserIcon, ClockIcon, MailOpenIcon, AlertTriangleIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface AdminMessagesClientProps {
  initialMessages: ContactMessageWithReplies[];
}

export function AdminMessagesClient({ initialMessages }: AdminMessagesClientProps) {
  const [messages, setMessages] = useState<ContactMessageWithReplies[]>(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState<"ALL" | "UNREAD">("ALL");

  // Reply state
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Archive confirmation modal state
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const selectedMsg = messages.find((m) => m.id === selectedId);

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterRead === "ALL" || (filterRead === "UNREAD" && !m.isRead);
    return matchSearch && matchFilter;
  });

  async function handleSelectMsg(msg: ContactMessageWithReplies) {
    setSelectedId(msg.id);
    setReplyStatus(null);
    setReplyBody("");
    if (!msg.isRead) {
      await markMessageReadAction(msg.id);
      setMessages((prev) =>
        prev.map((item) => (item.id === msg.id ? { ...item, isRead: true } : item))
      );
    }
  }

  async function handleToggleReadStatus(msg: ContactMessageWithReplies) {
    const newStatus = !msg.isRead;
    await toggleMessageReadAction(msg.id, newStatus);
    setMessages((prev) =>
      prev.map((item) => (item.id === msg.id ? { ...item, isRead: newStatus } : item))
    );
  }

  async function handleConfirmArchive() {
    if (!confirmArchiveId) return;
    setIsArchiving(true);
    try {
      const res = await softDeleteMessageAction(confirmArchiveId);
      if (res.success) {
        const remaining = messages.filter((m) => m.id !== confirmArchiveId);
        setMessages(remaining);
        if (selectedId === confirmArchiveId) setSelectedId(remaining[0]?.id ?? null);
      }
    } finally {
      setIsArchiving(false);
      setConfirmArchiveId(null);
    }
  }

  async function handleSendReply() {
    if (!selectedMsg || !replyBody.trim()) return;
    setIsSending(true);
    setReplyStatus(null);
    try {
      const res = await sendContactReplyAction({ messageId: selectedMsg.id, body: replyBody });
      setReplyStatus(res);
      if (res.success) {
        setReplyBody("");
        const newReply = {
          id: String(Date.now()),
          adminEmail: "Super Admin",
          body: replyBody,
          sentAt: new Date().toLocaleString(),
        };
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMsg.id
              ? { ...m, isRead: true, replies: [...m.replies, newReply] }
              : m
          )
        );
      }
    } catch (e) {
      setReplyStatus({ success: false, message: String(e) });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List Sidebar */}
        <Card className="border-[#1b2338] bg-[#0d1220] lg:col-span-1">
          <CardHeader className="p-4 pb-2 space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4 text-[#38b6ff]" /> Inbox ({messages.length})
              </CardTitle>
              <div className="flex items-center gap-1 bg-[#070a14] border border-[#1b2338] p-0.5 rounded-lg text-[10px]">
                <button
                  onClick={() => setFilterRead("ALL")}
                  className={`px-2 py-0.5 rounded font-mono ${filterRead === "ALL" ? "bg-[#1060ee] text-white" : "text-[#9aa4b8]"}`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setFilterRead("UNREAD")}
                  className={`px-2 py-0.5 rounded font-mono ${filterRead === "UNREAD" ? "bg-[#1060ee] text-white" : "text-[#9aa4b8]"}`}
                >
                  UNREAD
                </button>
              </div>
            </div>
            <div className="relative w-full">
              <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c6980]" />
              <input
                placeholder="Search inbox..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] pl-8 pr-3 py-1 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
              />
            </div>
          </CardHeader>

          <CardContent className="p-2 pt-0 max-h-[600px] overflow-y-auto divide-y divide-[#1b2338]/40">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-xs text-[#5c6980]">No messages found.</p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMsg(m)}
                  className={`w-full text-left p-3 rounded-xl transition-all space-y-1 ${
                    selectedId === m.id
                      ? "bg-[#131a2c] border border-[#1060ee]/40"
                      : "hover:bg-[#070a14]/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold flex items-center gap-1.5 ${!m.isRead ? "text-[#f3f6fc]" : "text-[#9aa4b8]"}`}>
                      {!m.isRead && <span className="h-2 w-2 rounded-full bg-[#38b6ff] shrink-0" />}
                      {m.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#5c6980] shrink-0">{m.createdAt.split(",")[0]}</span>
                  </div>
                  <div className="text-xs text-[#38b6ff] truncate font-medium">{m.subject}</div>
                  <div className="text-[11px] text-[#5c6980] line-clamp-1">{m.message}</div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Selected Message Detail & Reply Panel */}
        <Card className="border-[#1b2338] bg-[#0d1220] lg:col-span-2">
          {selectedMsg ? (
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1b2338]">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#f3f6fc]">{selectedMsg.subject}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#9aa4b8]">
                    <span className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5 text-[#38b6ff]" />{selectedMsg.name}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#38b6ff]"><MailIcon className="h-3.5 w-3.5" />{selectedMsg.email}</span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#5c6980]"><ClockIcon className="h-3 w-3" />{selectedMsg.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReadStatus(selectedMsg)}
                    title={selectedMsg.isRead ? "Mark as unread" : "Mark as read"}
                    className="p-2 rounded-lg border border-[#1b2338] text-[#9aa4b8] hover:text-[#38b6ff] hover:border-[#38b6ff]/40 transition-all shrink-0 text-xs flex items-center gap-1"
                  >
                    <MailOpenIcon className="h-4 w-4" />
                    <span className="text-[10px] font-mono">{selectedMsg.isRead ? "Mark Unread" : "Mark Read"}</span>
                  </button>
                  <button
                    onClick={() => setConfirmArchiveId(selectedMsg.id)}
                    title="Archive message"
                    className="p-2 rounded-lg border border-[#1b2338] text-[#9aa4b8] hover:text-rose-400 hover:border-rose-500/40 transition-all shrink-0 text-xs flex items-center gap-1"
                  >
                    <ArchiveIcon className="h-4 w-4" />
                    <span className="text-[10px] font-mono">Delete</span>
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="rounded-xl border border-[#1b2338] bg-[#070a14] p-4 text-xs text-[#f3f6fc] leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </div>

              {/* Threaded Replies */}
              {selectedMsg.replies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold font-mono uppercase text-[#38b6ff]">Previous Replies ({selectedMsg.replies.length})</h4>
                  {selectedMsg.replies.map((r) => (
                    <div key={r.id} className="rounded-xl border border-[#1060ee]/30 bg-[#1060ee]/10 p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#38b6ff] font-mono">
                        <span>Replied by {r.adminEmail}</span>
                        <span>{r.sentAt}</span>
                      </div>
                      <p className="text-[#f3f6fc] whitespace-pre-wrap">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Composer */}
              <div className="space-y-3 pt-2 border-t border-[#1b2338]">
                <h4 className="text-xs font-bold text-[#f3f6fc]">Send Email Reply via Resend</h4>
                {replyStatus && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${replyStatus.success ? "bg-[#2fe6b0]/10 border-[#2fe6b0]/40 text-[#2fe6b0]" : "bg-rose-500/10 border-rose-500/40 text-rose-400"}`}>
                    {replyStatus.success ? <CheckCircle2Icon className="h-4 w-4" /> : <AlertCircleIcon className="h-4 w-4" />}
                    {replyStatus.message}
                  </div>
                )}
                <textarea
                  rows={4}
                  placeholder={`Write reply to ${selectedMsg.email}...`}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={isSending || !replyBody.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50"
                >
                  {isSending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                  Send Email Reply
                </button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-12 text-center text-xs text-[#5c6980]">
              Select a contact submission from the inbox list to read and reply.
            </CardContent>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={!!confirmArchiveId} onOpenChange={(open) => !open && setConfirmArchiveId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border border-rose-500/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertTriangleIcon className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-[#f3f6fc]">
                  Delete Contact Message?
                </Dialog.Title>
                <p className="text-xs text-[#9aa4b8] mt-0.5">
                  Are you sure you want to soft-delete this inquiry? It will be archived and hidden from the inbox.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmArchiveId(null)}
                className="px-4 py-2 rounded-xl border border-[#1b2338] bg-[#0d1220] text-xs font-medium text-[#9aa4b8] hover:text-[#f3f6fc] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isArchiving ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : null}
                Confirm Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
