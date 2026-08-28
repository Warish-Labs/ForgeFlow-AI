import { getAdminMetricsAction } from "@/lib/actions/admin";
import { AdminSubscriptionsClient } from "./AdminSubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const metrics = await getAdminMetricsAction();
  return <AdminSubscriptionsClient subscribers={metrics.watchlistSubscribers} />;
}
