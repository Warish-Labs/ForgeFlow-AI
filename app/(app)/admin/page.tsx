import type { Metadata } from "next";
import { getAdminMetricsAction } from "@/lib/actions/admin";
import { AdminOverviewClient } from "./AdminOverviewClient";

export const metadata: Metadata = {
  title: "Admin Overview — ForgeFlow AI",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Admin Overview Tab — /admin
 * Security: Layout already gates non-admins before this page renders.
 */
export default async function AdminPage() {
  const metrics = await getAdminMetricsAction();
  return <AdminOverviewClient metrics={metrics} />;
}
