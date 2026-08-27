import type { Metadata } from "next";
import { getUserProjectsAction } from "@/lib/actions/project";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Force dynamic rendering since projects depend on auth session
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await getUserProjectsAction();

  return <DashboardClient initialProjects={projects} />;
}
