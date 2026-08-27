import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/Logo";
import { checkIsSuperAdminAction } from "@/lib/auth/admin";
import { ShieldAlertIcon, FolderGit2Icon } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = await checkIsSuperAdminAction();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface-base)]">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#1b2338] bg-[#070a14]/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center" aria-label="ForgeFlow AI — Dashboard">
              <Logo size="sm" />
            </Link>

            {isAdmin && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1060ee] bg-[#1060ee]/20 px-3 py-1 text-xs font-mono font-bold text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all shadow-sm"
                >
                  <ShieldAlertIcon className="h-3.5 w-3.5" />
                  Super Admin Panel
                </Link>
                <Link
                  href="/dashboard?view=portfolio"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1b2338] bg-[#0d1220] px-3 py-1 text-xs font-mono text-[#9aa4b8] hover:text-[#f3f6fc] hover:border-[#38b6ff] transition-all"
                >
                  <FolderGit2Icon className="h-3.5 w-3.5" />
                  User Workspaces
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="hidden md:inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1060ee]/20 text-[#38b6ff] border border-[#1060ee]/40">
                Super Admin Authorized
              </span>
            )}
            <UserButton
              appearance={{
                variables: {
                  colorPrimary: "#1a6fff",
                  colorBackground: "#0d1529",
                  colorText: "#e8f0ff",
                  borderRadius: "0.5rem",
                },
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
