"use server";

import { prisma } from "@/lib/db/prisma";
import { logAuditEventAction } from "@/lib/services/audit";

export async function joinWatchlistAction(email: string, source: string = "landing_modal"): Promise<{
  success: boolean;
  message: string;
}> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.watchlist.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: true, message: "You are already on our priority waitlist!" };
    }

    await prisma.watchlist.create({
      data: {
        email: cleanEmail,
        source,
        status: "active",
      },
    });

    await logAuditEventAction({
      userId: "anonymous",
      action: "ADMIN_ACTION",
      metadata: { type: "WATCHLIST_JOIN", email: cleanEmail, source },
    });

    return { success: true, message: "Successfully joined the priority waitlist!" };
  } catch (error: any) {
    console.error("Watchlist error:", error);
    return { success: false, message: "An error occurred while joining the waitlist. Please try again." };
  }
}
