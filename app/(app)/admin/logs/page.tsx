import { getAdminMetricsAction } from "@/lib/actions/admin";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminLogsClient } from "./AdminLogsClient";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  await requireAdminPage();
  const metrics = await getAdminMetricsAction();
  return <AdminLogsClient recentLogs={metrics.recentLogs} auditLogs={metrics.auditLogs} />;
}

