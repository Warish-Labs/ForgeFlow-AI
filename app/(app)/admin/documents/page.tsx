import { getAdminDocumentsAction } from "@/lib/actions/admin";
import { AdminDocumentsClient } from "./AdminDocumentsClient";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const docs = await getAdminDocumentsAction();
  return <AdminDocumentsClient documents={docs} />;
}
