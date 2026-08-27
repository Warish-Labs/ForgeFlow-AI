import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
  // All authenticated app pages are noindex (enforced in middleware too)
  robots: { index: false, follow: false },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface-base)]">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-[var(--border-subtle)] bg-[var(--navy-900)]/80 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center" aria-label="ForgeFlow AI — Dashboard">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
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
