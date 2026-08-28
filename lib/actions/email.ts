"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdminAction } from "@/lib/auth/admin";
import { logAuditEventAction } from "@/lib/services/audit";
import { clerkClient } from "@clerk/nextjs/server";

export interface SendAdminEmailParams {
  recipientType: "watchlist" | "tenants" | "custom";
  customEmails?: string;
  subject: string;
  htmlContent: string;
}

export async function sendAdminCustomEmailAction({
  recipientType,
  customEmails,
  subject,
  htmlContent,
}: SendAdminEmailParams): Promise<{
  success: boolean;
  message: string;
  sentCount?: number;
}> {
  const { email: adminEmail, userId: adminUserId } = await requireSuperAdminAction();

  if (!subject || !subject.trim()) {
    return { success: false, message: "Email subject cannot be empty." };
  }
  if (!htmlContent || !htmlContent.trim()) {
    return { success: false, message: "HTML content cannot be empty." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    return {
      success: false,
      message: "RESEND_API_KEY is not set or valid in environment. Please add RESEND_API_KEY to .env.",
    };
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "ForgeFlow AI <onboarding@resend.dev>";

  let recipients: string[] = [];

  if (recipientType === "watchlist") {
    const watchlistDelegate = (prisma as any).watchlist;
    const watchlist = watchlistDelegate
      ? await watchlistDelegate.findMany({
          where: { status: "active" },
          select: { email: true },
        })
      : [];
    recipients = watchlist.map((w: any) => w.email);
  } else if (recipientType === "tenants") {
    try {
      const client = await clerkClient();
      const { data: users } = await client.users.getUserList({ limit: 500 });
      recipients = users
        .map((u) => u.emailAddresses[0]?.emailAddress)
        .filter((e): e is string => Boolean(e));
    } catch (err) {
      console.error("Failed to fetch Clerk tenant emails:", err);
    }
  } else if (recipientType === "custom") {
    if (!customEmails || !customEmails.trim()) {
      return { success: false, message: "Please specify custom recipient email address(es)." };
    }
    recipients = customEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
  }

  // Remove duplicates
  recipients = Array.from(new Set(recipients));

  if (recipients.length === 0) {
    return { success: false, message: "No valid recipient email addresses found." };
  }

  let sentCount = 0;
  const errors: string[] = [];

  // Send batch or loop
  for (const recipient of recipients) {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: subject.trim(),
        html: htmlContent,
      });

      if (response.error) {
        errors.push(`${recipient}: ${response.error.message}`);
      } else {
        sentCount++;
      }
    } catch (err: any) {
      errors.push(`${recipient}: ${err.message || "Failed to send"}`);
    }
  }

  if (adminUserId) {
    await logAuditEventAction({
      userId: adminUserId,
      action: "ADMIN_ACTION",
      metadata: {
        type: "EMAIL_BROADCAST",
        subject: subject.trim(),
        recipientType,
        sentCount,
        totalRecipients: recipients.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : null,
      },
    });
  }

  if (sentCount === 0 && errors.length > 0) {
    return {
      success: false,
      message: `Failed to send email. Resend Error: ${errors[0]}`,
    };
  }

  return {
    success: true,
    message: `Successfully dispatched email to ${sentCount} recipient(s).${
      errors.length > 0 ? ` (${errors.length} failed)` : ""
    }`,
    sentCount,
  };
}
