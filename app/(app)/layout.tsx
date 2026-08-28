import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/Logo";
import { checkIsAdmin } from "@/lib/auth/guard";
import { AppNavLinks } from "@/components/layout/AppNavLinks";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check for this layout — determines which nav links to show
  // The actual page-level admin gating happens in each admin page/layout
  const { isAdmin } = await checkIsAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface-base)]">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#1b2338] bg-[#070a14]/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="flex items-center"
              aria-label="ForgeFlow AI — Dashboard"
            >
              <Logo size="sm" />
            </Link>

            {/* Client component handles usePathname-based active state */}
            <AppNavLinks isAdmin={isAdmin} />
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
