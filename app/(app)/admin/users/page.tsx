import { getAdminMetricsAction } from "@/lib/actions/admin";
import { AdminUsersClient } from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const metrics = await getAdminMetricsAction();
  return <AdminUsersClient userTable={metrics.userTable} watchlistSubscribers={metrics.watchlistSubscribers} />;
}
