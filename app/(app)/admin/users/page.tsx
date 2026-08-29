import { getAdminMetricsAction } from "@/lib/actions/admin";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminUsersClient } from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const metrics = await getAdminMetricsAction();
  return <AdminUsersClient userTable={metrics.userTable} watchlistSubscribers={metrics.watchlistSubscribers} />;
}

