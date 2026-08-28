"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlertIcon, FolderGit2Icon } from "lucide-react";

interface AppNavLinksProps {
  isAdmin: boolean;
}

/**
 * AppNavLinks — Server-gated, client-driven workspace navigation for admins.
 * Non-admin users receive null (no switch buttons shown).
 * Super-admins see both options with clear active route highlighting.
 */
export function AppNavLinks({ isAdmin }: AppNavLinksProps) {
  const pathname = usePathname();

  if (!isAdmin) return null;

  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/projects");

  return (
    <div className="hidden sm:flex items-center gap-2">
      <Link
        href="/admin"
        aria-current={isAdminPath ? "page" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-mono font-bold transition-all shadow-sm ${
          isAdminPath
            ? "border-[#1060ee] bg-[#1060ee] text-white shadow-blue-500/25"
            : "border-[#1060ee]/40 bg-[#1060ee]/15 text-[#38b6ff] hover:bg-[#1060ee] hover:text-white"
        }`}
      >
        <ShieldAlertIcon className="h-3.5 w-3.5" />
        Super Admin Panel
      </Link>

      <Link
        href="/dashboard"
        aria-current={isDashboardPath ? "page" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-mono font-bold transition-all shadow-sm ${
          isDashboardPath
            ? "border-[#1060ee] bg-[#1060ee] text-white shadow-blue-500/25"
            : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:text-[#f3f6fc] hover:border-[#38b6ff]"
        }`}
      >
        <FolderGit2Icon className="h-3.5 w-3.5" />
        User Workspaces
      </Link>
    </div>
  );
}
