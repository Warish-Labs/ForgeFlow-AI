import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getUserProjectsAction } from "@/lib/actions/project";
import { getUserQuotaUsageAction } from "@/lib/services/quota";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Force dynamic rendering since projects depend on auth session
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let userId: string | null = null;

  try {
    const session = await auth();
    userId = session.userId;
  } catch (_) {}

  // Gracefully fetch data — never let data errors bubble to error.tsx for users
  let projects: Awaited<ReturnType<typeof getUserProjectsAction>> = [];
  try {
    projects = await getUserProjectsAction();
  } catch (err) {
    console.error("[DashboardPage] getUserProjectsAction failed:", err);
  }

  let usage: Awaited<ReturnType<typeof getUserQuotaUsageAction>> | undefined;
  try {
    usage = await getUserQuotaUsageAction(userId || "system");
  } catch (err) {
    console.error("[DashboardPage] getUserQuotaUsageAction failed:", err);
  }

  return <DashboardClient initialProjects={projects} usage={usage} />;
}
