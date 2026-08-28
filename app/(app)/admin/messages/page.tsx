import { getContactMessagesAction } from "@/lib/actions/contact";
import { AdminMessagesClient } from "./AdminMessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getContactMessagesAction();
  return <AdminMessagesClient initialMessages={messages} />;
}
