import { getAdminMetricsAction } from "@/lib/actions/admin";
import { AdminLogsClient } from "./AdminLogsClient";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const metrics = await getAdminMetricsAction();
  return <AdminLogsClient recentLogs={metrics.recentLogs} auditLogs={metrics.auditLogs} />;
}
