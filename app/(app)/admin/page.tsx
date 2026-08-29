import type { Metadata } from "next";
import { getAdminMetricsAction } from "@/lib/actions/admin";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminOverviewClient } from "./AdminOverviewClient";

export const metadata: Metadata = {
  title: "Admin Overview — ForgeFlow AI",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Admin Overview Tab — /admin
 * Security: requireAdminPage redirects non-admins before invoking server action.
 */
export default async function AdminPage() {
  await requireAdminPage();
  const metrics = await getAdminMetricsAction();
  return <AdminOverviewClient metrics={metrics} />;
}

