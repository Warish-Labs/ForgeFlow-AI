"use client";

import { useState } from "react";
import {
  AdminMetricsResult,
  WatchlistSubscriberInfo,
  getAdminUserDetailsAction,
  forcePasswordResetAction,
  toggleUserBanAction,
} from "@/lib/actions/admin";
import { sendAdminCustomEmailAction } from "@/lib/actions/email";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon, SearchIcon, EyeIcon, XIcon, SendIcon, Loader2Icon,
  CheckCircle2Icon, AlertCircleIcon, ShieldOffIcon, KeyRoundIcon,
  MailIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type UserRow = AdminMetricsResult["userTable"][number];

interface AdminUsersClientProps {
  userTable: UserRow[];
  watchlistSubscribers: WatchlistSubscriberInfo[];
}

export function AdminUsersClient({ userTable, watchlistSubscribers }: AdminUsersClientProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"browse" | "broadcast">("browse");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // User detail modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Awaited<ReturnType<typeof getAdminUserDetailsAction>> | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Broadcast state
  const [selected, setSelected] = useState<Set<string>>(() => new Set(userTable.map((u) => u.userId)));
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastHtml, setBroadcastHtml] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Admin actions
  const [actionStatus, setActionStatus] = useState<{ userId: string; message: string; success: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = userTable.filter((u) =>
    u.userId.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function handleOpenUser(userId: string) {
    setSelectedUserId(userId);
    setIsLoadingUser(true);
    try {
      const d = await getAdminUserDetailsAction(userId);
      setUserDetails(d);
    } finally {
      setIsLoadingUser(false);
    }
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.userId)));
    }
  }

  async function handleSendBroadcast() {
    if (!broadcastSubject.trim() || !broadcastHtml.trim()) return;
    setIsSending(true);
    setSendStatus(null);
    const customEmails = userTable
      .filter((u) => selected.has(u.userId) && u.email)
      .map((u) => u.email)
      .join(",");
    try {
      const res = await sendAdminCustomEmailAction({ recipientType: "custom", customEmails, subject: broadcastSubject, htmlContent: broadcastHtml });
      setSendStatus(res);
    } catch (e) {
      setSendStatus({ success: false, message: String(e) });
    } finally {
      setIsSending(false);
    }
  }

  async function handleForceReset(userId: string) {
    setActionLoading(userId + "_reset");
    const res = await forcePasswordResetAction(userId);
    setActionStatus({ userId, ...res });
    setActionLoading(null);
  }

  async function handleToggleBan(userId: string, ban: boolean) {
    setActionLoading(userId + "_ban");
    const res = await toggleUserBanAction(userId, ban);
    setActionStatus({ userId, ...res });
    setActionLoading(null);
  }

  const statusColor = (s: string) => ({
    healthy: "text-[#2fe6b0] bg-[#2fe6b0]/10 border-[#2fe6b0]/30",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    critical: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    exhausted: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  }[s] ?? "text-[#9aa4b8] bg-[#1b2338] border-[#1b2338]");

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("browse")}
          className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${view === "browse" ? "bg-[#1060ee] text-white" : "text-[#9aa4b8] border border-[#1b2338] hover:text-[#f3f6fc]"}`}
        >
          <UsersIcon className="h-3.5 w-3.5 inline mr-1.5" />Browse Users
        </button>
        <button
          onClick={() => setView("broadcast")}
          className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${view === "broadcast" ? "bg-[#1060ee] text-white" : "text-[#9aa4b8] border border-[#1b2338] hover:text-[#f3f6fc]"}`}
        >
          <MailIcon className="h-3.5 w-3.5 inline mr-1.5" />Email Broadcast
        </button>
      </div>

      {view === "browse" ? (
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-[#38b6ff]" /> Tenant Directory ({userTable.length})
            </CardTitle>
            <div className="relative w-52">
              <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c6980]" />
              <input
                placeholder="Search name, email, ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] pl-8 pr-3 py-1 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2 overflow-x-auto space-y-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">User</th>
                  <th className="pb-2.5 font-normal">Role</th>
                  <th className="pb-2.5 font-normal">Signed Up</th>
                  <th className="pb-2.5 font-normal">Projects</th>
                  <th className="pb-2.5 font-normal">Tokens Used</th>
                  <th className="pb-2.5 font-normal">Last Active</th>
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {paginatedUsers.length === 0 ? (
                  <tr><td colSpan={8} className="py-6 text-center text-[#5c6980]">No users match your search.</td></tr>
                ) : paginatedUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-[#131a2c]/50">
                    <td className="py-2.5">
                      <div className="font-medium text-[#f3f6fc]">{u.fullName || "—"}</div>
                      <div className="text-[10px] text-[#5c6980] font-mono">{u.email || u.userId.substring(0, 16) + "…"}</div>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        u.role === "SUPER_ADMIN" ? "bg-purple-500/15 text-purple-300 border-purple-500/40" : "bg-[#1060ee]/15 text-[#38b6ff] border-[#1060ee]/30"
                      }`}>
                        {u.role || "USER"}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{u.createdAt || "N/A"}</td>
                    <td className="py-2.5 font-mono">{u.projectsCount}</td>
                    <td className="py-2.5 font-mono text-[#2fe6b0]">{u.tokensUsed.toLocaleString()}</td>
                    <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{u.lastActive}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${statusColor(u.status)}`}>{u.status}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleOpenUser(u.userId)} title="Inspect user" className="inline-flex items-center gap-1 rounded bg-[#131a2c] border border-[#1b2338] px-2 py-1 text-[11px] text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all">
                          <EyeIcon className="h-3 w-3" /> Inspect
                        </button>
                        <button onClick={() => handleForceReset(u.userId)} disabled={actionLoading === u.userId + "_reset"} title="Force session revocation" className="inline-flex items-center gap-1 rounded bg-[#131a2c] border border-amber-500/30 px-2 py-1 text-[11px] text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50">
                          {actionLoading === u.userId + "_reset" ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <KeyRoundIcon className="h-3 w-3" />}
                        </button>
                        <button onClick={() => handleToggleBan(u.userId, true)} disabled={actionLoading === u.userId + "_ban"} title="Ban user" className="inline-flex items-center gap-1 rounded bg-[#131a2c] border border-rose-500/30 px-2 py-1 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50">
                          {actionLoading === u.userId + "_ban" ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <ShieldOffIcon className="h-3 w-3" />}
                        </button>
                      </div>
                      {actionStatus?.userId === u.userId && (
                        <div className={`mt-1 text-[10px] font-mono ${actionStatus.success ? "text-[#2fe6b0]" : "text-rose-400"}`}>
                          {actionStatus.message}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-[#1b2338] text-xs font-mono text-[#9aa4b8]">
                <span>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} users
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-[#1b2338] bg-[#070a14] hover:bg-[#131a2c] disabled:opacity-50 transition-all text-[#f3f6fc]"
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-[#1b2338] bg-[#070a14] hover:bg-[#131a2c] disabled:opacity-50 transition-all text-[#f3f6fc]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Broadcast Section */
        <Card className="border border-[#1060ee]/40 bg-[#0d1220]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-[#38b6ff]" /> Email Broadcast Studio
            </CardTitle>
            <p className="text-xs text-[#9aa4b8]">Select recipients, compose your message, and broadcast via Resend.</p>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-5">
            {sendStatus && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${sendStatus.success ? "bg-[#2fe6b0]/10 border-[#2fe6b0]/40 text-[#2fe6b0]" : "bg-rose-500/10 border-rose-500/40 text-rose-400"}`}>
                {sendStatus.success ? <CheckCircle2Icon className="h-4 w-4" /> : <AlertCircleIcon className="h-4 w-4" />}
                {sendStatus.message}
              </div>
            )}

            {/* Recipient table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#9aa4b8]">{selected.size} of {filtered.length} recipients selected</span>
                <button onClick={toggleSelectAll} className="text-xs font-mono text-[#38b6ff] hover:underline">
                  {selected.size === filtered.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-[#1b2338] rounded-xl bg-[#070a14]">
                {filtered.map((u) => (
                  <label key={u.userId} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#131a2c]/50 border-b border-[#1b2338]/40 last:border-0">
                    <input
                      type="checkbox"
                      checked={selected.has(u.userId)}
                      onChange={(e) => {
                        const s = new Set(selected);
                        e.target.checked ? s.add(u.userId) : s.delete(u.userId);
                        setSelected(s);
                      }}
                      className="accent-[#1060ee]"
                    />
                    <span className="text-xs text-[#f3f6fc]">{u.fullName || u.userId.substring(0, 12)}</span>
                    <span className="text-[11px] text-[#5c6980] font-mono">{u.email}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Email Subject"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] px-4 py-2.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
              />
              <textarea
                rows={6}
                placeholder="HTML email body..."
                value={broadcastHtml}
                onChange={(e) => setBroadcastHtml(e.target.value)}
                className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs font-mono text-[#2fe6b0] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
              />
              <button
                onClick={handleSendBroadcast}
                disabled={isSending || selected.size === 0 || !broadcastSubject || !broadcastHtml}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50"
              >
                {isSending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                Send to {selected.size} recipients
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Detail Modal */}
      <Dialog.Root open={!!selectedUserId} onOpenChange={(o) => !o && setSelectedUserId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-[#1060ee]/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b2338]">
              <Dialog.Title className="text-base font-bold text-[#f3f6fc] flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-[#38b6ff]" /> User Detail
              </Dialog.Title>
              <Dialog.Close onClick={() => setSelectedUserId(null)} className="rounded p-1 hover:bg-[#1b2338]">
                <XIcon className="h-4 w-4" />
              </Dialog.Close>
            </div>
            {isLoadingUser || !userDetails ? (
              <div className="py-12 text-center text-xs text-[#9aa4b8]">Loading user data…</div>
            ) : (
              <div className="space-y-5 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Name", value: userDetails.clerkUser?.fullName || "—" },
                    { label: "Email", value: userDetails.clerkUser?.email || "—" },
                    { label: "Total Tokens", value: userDetails.stats.totalTokens.toLocaleString() },
                    { label: "Total Requests", value: String(userDetails.stats.totalRequests) },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                      <div className="text-[10px] text-[#5c6980]">{label}</div>
                      <div className="text-xs font-mono font-bold text-[#f3f6fc] truncate">{value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#38b6ff] uppercase tracking-wider mb-2">Owned Projects ({userDetails.projects.length})</h4>
                  {userDetails.projects.length === 0 ? (
                    <p className="text-xs text-[#5c6980]">No projects yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.projects.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                          <div>
                            <div className="text-xs font-bold text-[#f3f6fc]">{p.name}</div>
                            <div className="text-[10px] text-[#5c6980]">{p.ideaText.substring(0, 60)}…</div>
                          </div>
                          <span className="text-[10px] font-mono text-[#9aa4b8]">{p._count.documents} docs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
