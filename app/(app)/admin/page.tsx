import type { Metadata } from "next";
import { checkIsSuperAdminAction } from "@/lib/auth/admin";
import { getAdminMetricsAction } from "@/lib/actions/admin";
import { AdminClient } from "./AdminClient";
import { ShieldAlertIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Super Admin Control Panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { isAdmin, email } = await checkIsSuperAdminAction();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-rose-500/40 bg-[#0d1220] p-8 max-w-md space-y-4 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlertIcon className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-[#f3f6fc]">
            403 — Unauthorized Admin Access
          </h1>
          <p className="text-xs text-[#9aa4b8] leading-relaxed">
            Your account ({email || "anonymous"}) is not authorized to access the Super Admin governance panel. Only system administrative emails defined in <code className="text-[#38b6ff] font-mono">ADMIN_EMAIL_1</code> or <code className="text-[#38b6ff] font-mono">ADMIN_EMAIL_2</code> can view telemetry.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1060ee] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const metrics = await getAdminMetricsAction();

  return <AdminClient adminEmail={email || "Super Admin"} initialMetrics={metrics} />;
}
