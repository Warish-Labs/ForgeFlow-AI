import { getModelPricingAction } from "@/lib/actions/admin";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const pricings = await getModelPricingAction();
  return <AdminSettingsClient pricings={pricings} />;
}

