import { getAdminMetricsAction, getModelPricingAction } from "@/lib/actions/admin";
import { AdminAiUsageClient } from "./AdminAiUsageClient";

export const dynamic = "force-dynamic";

export default async function AdminAiUsagePage() {
  const [metrics, pricings] = await Promise.all([
    getAdminMetricsAction(),
    getModelPricingAction(),
  ]);

  return <AdminAiUsageClient metrics={metrics} pricings={pricings} />;
}
