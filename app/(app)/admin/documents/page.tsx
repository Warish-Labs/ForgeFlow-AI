import { getAdminDocumentsAction } from "@/lib/actions/admin";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminDocumentsClient } from "./AdminDocumentsClient";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  await requireAdminPage();
  const docs = await getAdminDocumentsAction();
  return <AdminDocumentsClient documents={docs} />;
}

