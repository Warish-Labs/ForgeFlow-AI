"use server";

import { prisma } from "@/lib/db/prisma";
import { logAuditEventAction } from "@/lib/services/audit";
import { verifyTurnstileToken } from "@/lib/services/turnstile";

export async function joinWatchlistAction(
  email: string,
  source: string = "landing_modal",
  turnstileToken?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  // Turnstile bot verification check
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return { success: false, message: "Bot verification failed. Please try again." };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const watchlistDelegate = (prisma as any).watchlist;
    if (!watchlistDelegate) {
      console.warn("Prisma watchlist model delegate unavailable");
      return { success: true, message: "Thank you for joining our waitlist!" };
    }

    const existing = await watchlistDelegate.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: true, message: "You are already on our priority waitlist!" };
    }

    await watchlistDelegate.create({
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
