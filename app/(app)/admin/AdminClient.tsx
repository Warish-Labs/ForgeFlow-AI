"use client";

import { useState } from "react";
import { AdminMetricsResult, getAdminUserDetailsAction, getAdminProjectDetailsAction } from "@/lib/actions/admin";
import { sendAdminCustomEmailAction } from "@/lib/actions/email";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ShieldAlertIcon,
  UsersIcon,
  FolderGit2Icon,
  CpuIcon,
  ActivityIcon,
  SearchIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ServerIcon,
  SparklesIcon,
  EyeIcon,
  XIcon,
  FileTextIcon,
  BarChart3Icon,
  LayersIcon,
  ClockIcon,
  MailIcon,
  SendIcon,
  CodeIcon,
  Loader2Icon,
  AlertCircleIcon,
  UserCheckIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface AdminClientProps {
  adminEmail: string;
  initialMetrics: AdminMetricsResult;
}

export function AdminClient({ adminEmail, initialMetrics }: AdminClientProps) {
  const [metrics] = useState<AdminMetricsResult>(initialMetrics);
  const [userSearch, setUserSearch] = useState("");
  const [watchlistSearch, setWatchlistSearch] = useState("");
  const [logFilter, setLogFilter] = useState("ALL");
  const [auditFilter, setAuditFilter] = useState("ALL");

  // Email broadcast studio state
  const [recipientType, setRecipientType] = useState<"watchlist" | "tenants" | "custom">("watchlist");
  const [customEmails, setCustomEmails] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHtml, setEmailHtml] = useState(
    `<div style="font-family: sans-serif; background-color: #070a14; color: #f3f6fc; padding: 32px; border-radius: 12px;">\n  <h2 style="color: #38b6ff;">ForgeFlow AI Update</h2>\n  <p>Hello,</p>\n  <p>We are thrilled to announce new updates to ForgeFlow AI platform!</p>\n  <hr style="border: 0; border-top: 1px solid #1b2338; margin: 20px 0;" />\n  <p style="font-size: 12px; color: #9aa4b8;">Sent via ForgeFlow AI Super Admin Governance</p>\n</div>`
  );
  const [emailTab, setEmailTab] = useState<"code" | "preview">("code");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Selected drill-down states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, any> | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<Record<string, any> | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const filteredUsers = metrics.userTable.filter((u) =>
    u.userId.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredWatchlist = (metrics.watchlistSubscribers || []).filter((w) =>
    w.email.toLowerCase().includes(watchlistSearch.toLowerCase())
  );

  const filteredLogs = metrics.recentLogs.filter((l) => {
    if (logFilter === "ALL") return true;
    return l.status === logFilter;
  });

  const filteredAuditLogs = metrics.auditLogs.filter((a) => {
    if (auditFilter === "ALL") return true;
    return a.action === auditFilter;
  });

  async function handleSendCustomEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailSubject.trim() || !emailHtml.trim()) return;

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await sendAdminCustomEmailAction({
        recipientType,
        customEmails,
        subject: emailSubject,
        htmlContent: emailHtml,
      });

      setEmailStatus(res);
      if (res.success) {
        setEmailSubject("");
      }
    } catch (err: any) {
      setEmailStatus({ success: false, message: err.message || "Failed to send email broadcast." });
    } finally {
      setIsSendingEmail(false);
    }
  }

  async function handleOpenUserModal(userId: string) {
    setSelectedUserId(userId);
    setIsLoadingUser(true);
    try {
      const details = await getAdminUserDetailsAction(userId);
      setUserDetails(details);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingUser(false);
    }
  }

  async function handleOpenProjectModal(projId: string) {
    setSelectedProjectId(projId);
    setIsLoadingProject(true);
    try {
      const details = await getAdminProjectDetailsAction(projId);
      setProjectDetails(details);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingProject(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] pb-24">
      <div className="max-w-[1450px] mx-auto px-6 md:px-12 pt-8 space-y-8">
        
        {/* Admin Header Banner */}
        <div className="rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] p-6 md:p-8 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-96 bg-[#1060ee]/20 blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="pill-tag uppercase border-[#1060ee] text-[#38b6ff] bg-[#1060ee]/20">
                  SUPER ADMIN PLATFORM GOVERNANCE
                </span>
                <span className="text-[11px] font-mono text-[#9aa4b8]">
                  Authenticated as: <strong className="text-[#38b6ff]">{adminEmail}</strong>
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#f3f6fc]">
                Telemetry & System Analytics
              </h1>
              <p className="text-xs md:text-sm text-[#9aa4b8]">
                Real-time multi-tenant telemetry, database usage quotas, LLM token consumption, system health, and audit logs.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#070a14] border border-[#1b2338] px-4 py-2 text-xs font-mono text-[#2fe6b0] shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2fe6b0] animate-pulse" />
              SYSTEM STATUS: 100% OPERATIONAL
            </div>
          </div>
        </div>

        {/* 6 Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Total Tenants</span>
                <UsersIcon className="h-4 w-4 text-[#38b6ff]" />
              </div>
              <div className="text-xl font-bold text-[#f3f6fc]">{metrics.overview.totalUsers}</div>
              <p className="text-[10px] text-[#5c6980]">Distinct users</p>
            </CardContent>
          </Card>

          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Watchlist</span>
                <MailIcon className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400">{metrics.overview.totalWatchlistSubscribers}</div>
              <p className="text-[10px] text-[#5c6980]">Priority waitlist</p>
            </CardContent>
          </Card>

          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Total Projects</span>
                <FolderGit2Icon className="h-4 w-4 text-[#1060ee]" />
              </div>
              <div className="text-xl font-bold text-[#38b6ff]">{metrics.overview.totalProjects}</div>
              <p className="text-[10px] text-[#5c6980]">Active workspaces</p>
            </CardContent>
          </Card>

          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Tokens Month</span>
                <CpuIcon className="h-4 w-4 text-[#2fe6b0]" />
              </div>
              <div className="text-xl font-bold text-[#2fe6b0]">
                {(metrics.overview.tokensThisMonth / 1000).toFixed(1)}k
              </div>
              <p className="text-[10px] text-[#5c6980]">Current month LLM tokens</p>
            </CardContent>
          </Card>

          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Tokens Today</span>
                <BarChart3Icon className="h-4 w-4 text-[#38b6ff]" />
              </div>
              <div className="text-xl font-bold text-[#38b6ff]">
                {(metrics.overview.tokensToday / 1000).toFixed(1)}k
              </div>
              <p className="text-[10px] text-[#5c6980]">Tokens used today</p>
            </CardContent>
          </Card>

          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Requests Month</span>
                <ActivityIcon className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400">{metrics.overview.requestsThisMonth}</div>
              <p className="text-[10px] text-[#5c6980]">Monthly AI operations</p>
            </CardContent>
          </Card>

          <Card className="border-[#1b2338] bg-[#0d1220]">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-[#9aa4b8]">
                <span className="text-[11px] font-mono">Success Rate</span>
                <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0]" />
              </div>
              <div className="text-xl font-bold text-[#f3f6fc]">{metrics.overview.successRatePercent}%</div>
              <p className="text-[10px] text-[#5c6980]">{metrics.overview.failedRequests} failure events</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Custom HTML Email Broadcast Studio (Resend Integration) ─────────────── */}
        <Card className="border border-[#1060ee]/40 bg-[#0d1220] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-80 bg-[#1060ee]/10 blur-[90px] pointer-events-none" />
          <CardHeader className="p-6 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="pill-tag uppercase border-[#1060ee] text-[#38b6ff] bg-[#1060ee]/20">
                  RESEND EMAIL ENGINE
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-[#f3f6fc] flex items-center gap-2">
                <MailIcon className="h-5 w-5 text-[#38b6ff]" /> Custom HTML Email Broadcast Studio
              </CardTitle>
              <p className="text-xs text-[#9aa4b8]">
                Send customized HTML newsletters and announcements to Watchlist subscribers, registered tenants, or custom addresses.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#070a14] border border-[#1b2338] p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setEmailTab("code")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  emailTab === "code" ? "bg-[#1060ee] text-white font-bold" : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                <CodeIcon className="h-3.5 w-3.5" /> HTML Code
              </button>
              <button
                type="button"
                onClick={() => setEmailTab("preview")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  emailTab === "preview" ? "bg-[#1060ee] text-white font-bold" : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                <EyeIcon className="h-3.5 w-3.5" /> Live Preview
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-3 space-y-5">
            {emailStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 ${
                  emailStatus.success
                    ? "bg-[#2fe6b0]/10 border-[#2fe6b0]/40 text-[#2fe6b0]"
                    : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {emailStatus.success ? (
                    <CheckCircle2Icon className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircleIcon className="h-4 w-4 shrink-0" />
                  )}
                  <span>{emailStatus.message}</span>
                </div>
                <button onClick={() => setEmailStatus(null)} className="text-current opacity-70 hover:opacity-100">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendCustomEmail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Audience Radio Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-[#9aa4b8] block">Target Recipient Audience:</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1b2338] bg-[#070a14] cursor-pointer hover:border-[#38b6ff]/50 transition-all">
                      <input
                        type="radio"
                        name="recipientType"
                        value="watchlist"
                        checked={recipientType === "watchlist"}
                        onChange={() => setRecipientType("watchlist")}
                        className="accent-[#1060ee]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#f3f6fc]">Watchlist Subscribers ({metrics.overview.totalWatchlistSubscribers})</div>
                        <div className="text-[10px] text-[#5c6980]">Priority waitlist signups from landing page</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1b2338] bg-[#070a14] cursor-pointer hover:border-[#38b6ff]/50 transition-all">
                      <input
                        type="radio"
                        name="recipientType"
                        value="tenants"
                        checked={recipientType === "tenants"}
                        onChange={() => setRecipientType("tenants")}
                        className="accent-[#1060ee]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#f3f6fc]">Registered Tenants ({metrics.overview.totalUsers})</div>
                        <div className="text-[10px] text-[#5c6980]">All Clerk registered platform user accounts</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1b2338] bg-[#070a14] cursor-pointer hover:border-[#38b6ff]/50 transition-all">
                      <input
                        type="radio"
                        name="recipientType"
                        value="custom"
                        checked={recipientType === "custom"}
                        onChange={() => setRecipientType("custom")}
                        className="accent-[#1060ee]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#f3f6fc]">Custom Email Address(es)</div>
                        <div className="text-[10px] text-[#5c6980]">Send to specific manual recipient list</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Email Subject & Custom Input */}
                <div className="space-y-4 md:col-span-2">
                  {recipientType === "custom" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9aa4b8]">Custom Email Recipients (comma-separated):</label>
                      <input
                        type="text"
                        placeholder="user1@domain.com, user2@domain.com"
                        value={customEmails}
                        onChange={(e) => setCustomEmails(e.target.value)}
                        className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] px-4 py-2 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
                        required={recipientType === "custom"}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#9aa4b8]">Email Subject Line:</label>
                    <input
                      type="text"
                      placeholder="🚀 Exciting Updates from ForgeFlow AI Team"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] px-4 py-2.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none font-medium"
                      required
                    />
                  </div>

                  {emailTab === "code" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9aa4b8]">HTML Code Body (Resend Email Format):</label>
                      <textarea
                        rows={7}
                        value={emailHtml}
                        onChange={(e) => setEmailHtml(e.target.value)}
                        className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs font-mono text-[#2fe6b0] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none leading-relaxed"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9aa4b8]">Live Email HTML Render Preview:</label>
                      <div className="rounded-xl border border-[#1b2338] bg-white p-4 max-h-[220px] overflow-y-auto shadow-inner text-black">
                        <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1b2338]/60">
                <span className="text-[11px] font-mono text-[#5c6980]">
                  Resend Service: <strong className="text-[#38b6ff]">Active</strong> · Sender Domain: <strong className="text-[#38b6ff]">onboarding@resend.dev</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSendingEmail || !emailSubject.trim() || !emailHtml.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0a2a9c] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" /> Dispatching Broadcast...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4" /> Broadcast Email via Resend
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tenant Telemetry Directory Table & Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Telemetry Table */}
          <Card className="border-[#1b2338] bg-[#0d1220] lg:col-span-2">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-[#38b6ff]" /> Tenant Telemetry Directory
                </CardTitle>
                <p className="text-[11px] text-[#9aa4b8]">
                  Click on any user row to view complete account inspection & quota drill-down
                </p>
              </div>
              <div className="relative w-52">
                <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c6980]" />
                <input
                  type="text"
                  placeholder="Search user ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] pl-8 pr-3 py-1 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
                />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                    <th className="pb-2.5 font-normal">User Identifier</th>
                    <th className="pb-2.5 font-normal">Plan</th>
                    <th className="pb-2.5 font-normal">Projects</th>
                    <th className="pb-2.5 font-normal">Tokens Used</th>
                    <th className="pb-2.5 font-normal">Quota Status</th>
                    <th className="pb-2.5 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-[#5c6980]">
                        No user tenants match search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-[#131a2c]/50">
                        <td className="py-2.5 font-mono text-[11px] text-[#38b6ff]">
                          {u.userId.substring(0, 18)}...
                        </td>
                        <td className="py-2.5 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-[#1060ee]/15 text-[#38b6ff] border border-[#1060ee]/30">
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono">{u.projectsCount}</td>
                        <td className="py-2.5 font-mono text-[#2fe6b0]">
                          {u.tokensUsed.toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              u.status === "healthy"
                                ? "text-[#2fe6b0] bg-[#2fe6b0]/10 border-[#2fe6b0]/30"
                                : u.status === "warning"
                                ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                                : u.status === "critical"
                                ? "text-orange-400 bg-orange-400/10 border-orange-400/30"
                                : "text-rose-500 bg-rose-500/10 border-rose-500/30"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => handleOpenUserModal(u.userId)}
                            className="inline-flex items-center gap-1 rounded bg-[#131a2c] border border-[#1b2338] px-2.5 py-1 text-[11px] text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
                          >
                            <EyeIcon className="h-3 w-3" /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* AI Providers & Operation Breakdown */}
          <div className="space-y-6 lg:col-span-1">
            {/* Watchlist Subscribers Directory Card */}
            <Card className="border-[#1b2338] bg-[#0d1220]">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-amber-400" /> Watchlist Subscribers ({metrics.overview.totalWatchlistSubscribers})
                  </CardTitle>
                  <p className="text-[10px] text-[#9aa4b8]">
                    Priority launch & waitlist signups
                  </p>
                </div>
                <div className="relative w-28">
                  <SearchIcon className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#5c6980]" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={watchlistSearch}
                    onChange={(e) => setWatchlistSearch(e.target.value)}
                    className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] pl-6 pr-1.5 py-0.5 text-[10px] text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono text-[10px]">
                      <th className="pb-1.5 font-normal">Subscriber Email</th>
                      <th className="pb-1.5 font-normal">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                    {filteredWatchlist.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-3 text-center text-[#5c6980] text-[11px]">
                          No watchlist subscribers yet.
                        </td>
                      </tr>
                    ) : (
                      filteredWatchlist.map((w) => (
                        <tr key={w.id} className="hover:bg-[#131a2c]/50">
                          <td className="py-1.5 font-mono text-[11px] text-[#38b6ff] truncate max-w-[140px]">
                            {w.email}
                          </td>
                          <td className="py-1.5 font-mono text-[9px] text-[#9aa4b8]">
                            {w.createdAt}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-[#1b2338] bg-[#0d1220]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                  <ServerIcon className="h-4 w-4 text-[#38b6ff]" /> Provider & Model Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5">
                {metrics.providers.map((p) => (
                  <div key={p.provider} className="rounded-xl border border-[#1b2338] bg-[#070a14] p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold uppercase text-[#38b6ff]">{p.provider}</span>
                      <span className="text-[#9aa4b8] font-mono text-[10px]">{p.totalRequests} calls</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#5c6980]">
                      <span>Tokens:</span>
                      <span className="font-mono text-[#f3f6fc] font-semibold">{p.totalTokens.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#1b2338] bg-[#0d1220]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                  <CpuIcon className="h-4 w-4 text-[#2fe6b0]" /> Operation Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                {metrics.operations.map((op) => (
                  <div key={op.operation} className="flex items-center justify-between text-xs py-1 border-b border-[#1b2338]/40">
                    <span className="font-mono text-[#9aa4b8] uppercase">{op.operation}</span>
                    <span className="font-mono text-[#2fe6b0]">{op.totalTokens.toLocaleString()} tokens ({op.totalRequests} reqs)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Audit Trail Log */}
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-[#38b6ff]" /> Audit Log & System Events
              </CardTitle>
              <p className="text-[11px] text-[#9aa4b8]">
                Persistent event log: project creation/deletion, AI quota limits hit, admin access, document generation
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#070a14] border border-[#1b2338] p-1 rounded-lg">
              {["ALL", "PROJECT_CREATED", "AI_QUOTA_TRIGGERED", "ADMIN_ACCESS", "DOCUMENT_GENERATED"].map((act) => (
                <button
                  key={act}
                  onClick={() => setAuditFilter(act)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                    auditFilter === act ? "bg-[#1060ee] text-white font-semibold" : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">User ID</th>
                  <th className="pb-2.5 font-normal">Action Event</th>
                  <th className="pb-2.5 font-normal">Project ID</th>
                  <th className="pb-2.5 font-normal">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[#5c6980]">
                      No system audit events recorded.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-[#131a2c]/50">
                      <td className="py-2 font-mono text-[11px] text-[#9aa4b8]">{a.createdAt}</td>
                      <td className="py-2 font-mono text-[11px] text-[#38b6ff]">{a.userId.substring(0, 16)}...</td>
                      <td className="py-2 font-mono text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded border uppercase text-[10px] ${
                            a.action === "AI_QUOTA_TRIGGERED"
                              ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                              : a.action === "PROJECT_CREATED"
                              ? "bg-[#2fe6b0]/10 text-[#2fe6b0] border-[#2fe6b0]/30"
                              : "bg-[#1060ee]/10 text-[#38b6ff] border-[#1060ee]/30"
                          }`}
                        >
                          {a.action}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-[11px] text-[#9aa4b8]">{a.projectId || "—"}</td>
                      <td className="py-2 font-mono text-[10px] text-[#5c6980]">
                        {JSON.stringify(a.metadata || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* AI Provider Audit Executions */}
        <Card className="border-[#1b2338] bg-[#0d1220]">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-[#38b6ff]" /> AI Provider Execution Trace Log
              </CardTitle>
              <p className="text-[11px] text-[#9aa4b8]">
                Real-time trace log of LLM syntheses, search queries, token counts, and execution status
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#070a14] border border-[#1b2338] p-1 rounded-lg">
              {["ALL", "success", "error", "quota_exceeded"].map((st) => (
                <button
                  key={st}
                  onClick={() => setLogFilter(st)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                    logFilter === st ? "bg-[#1060ee] text-white font-semibold" : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                  }`}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">Operation</th>
                  <th className="pb-2.5 font-normal">Provider / Model</th>
                  <th className="pb-2.5 font-normal">Tokens</th>
                  <th className="pb-2.5 font-normal">Latency</th>
                  <th className="pb-2.5 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2338]/60 text-[#f3f6fc]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#5c6980]">
                      No execution logs match filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-[#131a2c]/50">
                      <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{l.createdAt}</td>
                      <td className="py-2.5 font-mono uppercase text-[#38b6ff]">{l.operation}</td>
                      <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">
                        {l.provider} ({l.model || "default"})
                      </td>
                      <td className="py-2.5 font-mono text-[#2fe6b0]">{l.totalTokens}</td>
                      <td className="py-2.5 font-mono text-[#9aa4b8]">{l.durationMs}ms</td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                            l.status === "success"
                              ? "bg-[#2fe6b0]/10 text-[#2fe6b0] border-[#2fe6b0]/30"
                              : l.status === "quota_exceeded"
                              ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {l.status === "success" ? <CheckCircle2Icon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>

      {/* User Details Inspection Modal */}
      <Dialog.Root open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-[#1060ee]/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b2338]">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-[#38b6ff]" />
                <Dialog.Title className="text-base font-bold text-[#f3f6fc]">
                  Tenant Telemetry Details
                </Dialog.Title>
              </div>
              <Dialog.Close onClick={() => setSelectedUserId(null)} className="rounded p-1 hover:bg-[#1b2338]">
                <XIcon className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {isLoadingUser || !userDetails ? (
              <div className="py-12 text-center text-xs text-[#9aa4b8]">Loading user telemetry...</div>
            ) : (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                    <div className="text-[10px] text-[#5c6980]">User ID</div>
                    <div className="text-xs font-mono font-bold text-[#38b6ff] truncate">{userDetails.userId}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                    <div className="text-[10px] text-[#5c6980]">Total Tokens</div>
                    <div className="text-xs font-mono font-bold text-[#2fe6b0]">{userDetails.stats.totalTokens.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                    <div className="text-[10px] text-[#5c6980]">Total Requests</div>
                    <div className="text-xs font-mono font-bold text-amber-400">{userDetails.stats.totalRequests}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                    <div className="text-[10px] text-[#5c6980]">Projects Owned</div>
                    <div className="text-xs font-mono font-bold text-[#f3f6fc]">{userDetails.projects.length}</div>
                  </div>
                </div>

                {/* Projects Owned List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#38b6ff] uppercase tracking-wider">Owned Workspaces</h4>
                  {userDetails.projects.length === 0 ? (
                    <p className="text-xs text-[#5c6980]">No active workspaces.</p>
                  ) : (
                    userDetails.projects.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-[#1b2338] bg-[#0d1220]">
                        <div>
                          <div className="text-xs font-bold text-[#f3f6fc]">{p.name}</div>
                          <div className="text-[10px] text-[#5c6980]">{p.ideaText.substring(0, 60)}...</div>
                        </div>
                        <button
                          onClick={() => handleOpenProjectModal(p.id)}
                          className="px-2.5 py-1 text-[10px] font-mono rounded bg-[#131a2c] text-[#38b6ff] border border-[#1b2338] hover:bg-[#1060ee] hover:text-white"
                        >
                          Inspect Blueprint
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Project Details Inspection Modal */}
      <Dialog.Root open={!!selectedProjectId} onOpenChange={(open) => !open && setSelectedProjectId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-[#1060ee]/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b2338]">
              <div className="flex items-center gap-2">
                <FolderGit2Icon className="h-5 w-5 text-[#38b6ff]" />
                <Dialog.Title className="text-base font-bold text-[#f3f6fc]">
                  Blueprint Architecture Metadata
                </Dialog.Title>
              </div>
              <Dialog.Close onClick={() => setSelectedProjectId(null)} className="rounded p-1 hover:bg-[#1b2338]">
                <XIcon className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {isLoadingProject || !projectDetails ? (
              <div className="py-12 text-center text-xs text-[#9aa4b8]">Loading blueprint metadata...</div>
            ) : (
              <div className="space-y-4 pt-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#f3f6fc]">{projectDetails.name}</h3>
                  <p className="text-[#9aa4b8] mt-1">{projectDetails.ideaText}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center py-3 rounded-xl bg-[#0d1220] border border-[#1b2338]">
                  <div>
                    <span className="text-[10px] text-[#5c6980] block">Features</span>
                    <strong className="text-[#38b6ff]">{projectDetails.features.length}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5c6980] block">ADR Decisions</span>
                    <strong className="text-[#38b6ff]">{projectDetails.decisions.length}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5c6980] block">Roadmap Items</span>
                    <strong className="text-[#38b6ff]">{projectDetails.roadmapItems.length}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5c6980] block">Documents</span>
                    <strong className="text-[#2fe6b0]">{projectDetails.documents.length}</strong>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
