import { getAdminMetricsAction } from "@/lib/actions/admin";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminSubscriptionsClient } from "./AdminSubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await requireAdminPage();
  const metrics = await getAdminMetricsAction();
  return <AdminSubscriptionsClient subscribers={metrics.watchlistSubscribers} />;
}

