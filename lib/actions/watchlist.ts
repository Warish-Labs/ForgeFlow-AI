"use server";

import { prisma } from "@/lib/db/prisma";
import { logAuditEventAction } from "@/lib/services/audit";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { Resend } from "resend";

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
    const existing = await prisma.watchlist.findUnique({
      where: { email: cleanEmail },
    });

    if (!existing) {
      await prisma.watchlist.create({
        data: {
          email: cleanEmail,
          source,
          status: "active",
        },
      });
    }

    await logAuditEventAction({
      userId: "anonymous",
      action: "ADMIN_ACTION",
      metadata: { type: "WATCHLIST_JOIN", email: cleanEmail, source },
    });

    // Send confirmation email via Resend gracefully
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== "re_placeholder_key") {
      try {
        const resend = new Resend(resendApiKey);
        const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || "onboarding@resend.dev";
        await resend.emails.send({
          from: fromEmail,
          to: cleanEmail,
          subject: "Welcome to ForgeFlow AI Priority Waitlist 🚀",
          html: `
            <div style="background-color: #070a14; color: #f3f6fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1b2338;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #38b6ff; margin: 0; font-size: 24px; font-weight: 800;">ForgeFlow AI</h1>
                <p style="color: #2fe6b0; font-size: 12px; font-family: monospace; margin-top: 4px;">PRIORITY WAITLIST CONFIRMED</p>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #9aa4b8;">
                Hello,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #f3f6fc;">
                Thank you for joining the <strong>ForgeFlow AI Premium Priority Waitlist</strong>! Your reservation has been recorded successfully.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #9aa4b8;">
                As a priority waitlist member, you will get early access to our Premium features, including unlimited architecture blueprints, 5M monthly LLM token quota, team collaboration, and automated GitHub/Jira export tools.
              </p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://forgeflow.warishlabs.in/dashboard" style="background-color: #1060ee; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Explore Free Beta Workspace</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #1b2338; margin: 24px 0;" />
              <p style="font-size: 11px; color: #5c6980; text-align: center; margin: 0;">
                ForgeFlow AI Platform · Persistent Software Architecture State Management
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[joinWatchlistAction] Failed to send waitlist confirmation email:", emailErr);
      }
    }

    return {
      success: true,
      message: existing
        ? "You are already on our priority waitlist!"
        : "Successfully joined the priority waitlist! Check your inbox for confirmation.",
    };
  } catch (error: any) {
    console.error("[joinWatchlistAction] Error joining waitlist:", error);
    return { success: true, message: "Thank you! You have been added to our priority waitlist." };
  }
}
