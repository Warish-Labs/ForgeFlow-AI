import type { Metadata } from "next";
import Link from "next/link";
import { checkIsAdmin } from "@/lib/auth/guard";
import { AdminTabNav } from "@/components/admin/AdminTabNav";
import { getUnreadMessageCountAction } from "@/lib/actions/contact";
import { ShieldAlertIcon, ArrowLeftIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Super Admin — ForgeFlow AI",
  robots: { index: false, follow: false },
};

/**
 * Admin Layout — Server Component
 *
 * Security: Runs checkIsAdmin() on EVERY request to /admin/*.
 * Non-admin authenticated users see a 403 page — they NEVER get access to
 * any admin data, even if they manually navigate to /admin/users or any sub-route.
 *
 * The Clerk middleware (proxy.ts) already ensures the user is authenticated.
 * This layout provides the second security layer: admin email whitelist check.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, email } = await checkIsAdmin();

  // Layer 2 security gate — renders before any child page content
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-rose-500/40 bg-[#0d1220] p-8 max-w-md space-y-5 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlertIcon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#f3f6fc]">
              403 — Unauthorized Admin Access
            </h1>
            <p className="text-xs text-[#9aa4b8] leading-relaxed">
              Your account ({email || "anonymous"}) is not authorized to access
              the Super Admin governance panel. Only system administrative
              accounts can view this area.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Return to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch unread count for the Messages tab badge
  let unreadCount = 0;
  try {
    unreadCount = await getUnreadMessageCountAction();
  } catch (_) {}

  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc]">
      {/* Admin header banner */}
      <div className="border-b border-[#1060ee]/30 bg-[#0d1220]">
        <div className="max-w-[1450px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlertIcon className="h-4 w-4 text-[#38b6ff]" />
            <span className="text-xs font-mono font-bold text-[#38b6ff] uppercase">
              Super Admin Governance Panel
            </span>
            <span className="text-[11px] font-mono text-[#5c6980]">
              — Authenticated as{" "}
              <strong className="text-[#9aa4b8]">{email}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#070a14] border border-[#1b2338] px-3 py-1.5 text-[11px] font-mono text-[#2fe6b0] shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#2fe6b0] animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </div>
      </div>

      {/* Tab navigation — client component for live active state */}
      <AdminTabNav unreadMessages={unreadCount} />

      {/* Tab content */}
      <div className="max-w-[1450px] mx-auto px-4 md:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
