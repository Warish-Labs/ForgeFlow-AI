import { getModelPricingAction } from "@/lib/actions/admin";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const pricings = await getModelPricingAction();
  return <AdminSettingsClient pricings={pricings} />;
}
