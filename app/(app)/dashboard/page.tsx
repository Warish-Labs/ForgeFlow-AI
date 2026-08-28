import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsSuperAdminAction } from "@/lib/auth/admin";
import { getUserProjectsAction } from "@/lib/actions/project";
import { getUserQuotaUsageAction } from "@/lib/services/quota";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Force dynamic rendering since projects depend on auth session
export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const projects = await getUserProjectsAction();
  const usage = await getUserQuotaUsageAction(userId || "system");

  return <DashboardClient initialProjects={projects} usage={usage} />;
}
