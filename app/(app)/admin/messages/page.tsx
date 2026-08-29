import { getContactMessagesAction } from "@/lib/actions/contact";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminMessagesClient } from "./AdminMessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdminPage();
  const messages = await getContactMessagesAction();
  return <AdminMessagesClient initialMessages={messages} />;
}

