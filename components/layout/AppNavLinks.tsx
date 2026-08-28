"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlertIcon, FolderGit2Icon } from "lucide-react";

interface AppNavLinksProps {
  isAdmin: boolean;
}

/**
 * AppNavLinks — Client component so we can use usePathname() for live active state.
 * Active state is derived from the actual current route, never from stored/cached state.
 */
export function AppNavLinks({ isAdmin }: AppNavLinksProps) {
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/projects");

  if (!isAdmin) return null;

  return (
    <div className="hidden sm:flex items-center gap-2">
      <Link
        href="/admin"
        aria-current={isAdminPath ? "page" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-mono font-bold transition-all shadow-sm ${
          isAdminPath
            ? "border-[#1060ee] bg-[#1060ee] text-white"
            : "border-[#1060ee] bg-[#1060ee]/20 text-[#38b6ff] hover:bg-[#1060ee] hover:text-white"
        }`}
      >
        <ShieldAlertIcon className="h-3.5 w-3.5" />
        Super Admin Panel
      </Link>

      <Link
        href="/dashboard"
        aria-current={isDashboardPath ? "page" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-mono transition-all ${
          isDashboardPath
            ? "border-[#38b6ff] bg-[#131a2c] text-[#f3f6fc]"
            : "border-[#1b2338] bg-[#0d1220] text-[#9aa4b8] hover:text-[#f3f6fc] hover:border-[#38b6ff]"
        }`}
      >
        <FolderGit2Icon className="h-3.5 w-3.5" />
        User Workspaces
      </Link>
    </div>
  );
}
