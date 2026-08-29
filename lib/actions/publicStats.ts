"use server";

import { prisma } from "@/lib/db/prisma";

export async function getPublicStatsAction(): Promise<{ totalDocuments: number; totalProjects: number }> {
  try {
    const [totalDocuments, totalProjects] = await Promise.all([
      prisma.document.count(),
      prisma.project.count(),
    ]);
    return { totalDocuments, totalProjects };
  } catch (err) {
    console.error("[getPublicStatsAction] Error:", err);
    return { totalDocuments: 12, totalProjects: 5 };
  }
}
