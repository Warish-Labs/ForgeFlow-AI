"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { logAuditEventAction } from "@/lib/services/audit";
import { clerkClient } from "@clerk/nextjs/server";

export interface SendAdminEmailParams {
  recipientType: "watchlist" | "tenants" | "selected_users" | "custom";
  customEmails?: string;
  selectedUserIds?: string[];
  subject: string;
  htmlContent: string;
}

export interface BroadcastResult {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  errors: string[];
}

export async function sendAdminCustomEmailAction({
  recipientType,
  customEmails,
  selectedUserIds = [],
  subject,
  htmlContent,
}: SendAdminEmailParams): Promise<BroadcastResult> {
  const { email: adminEmail, userId: adminUserId } = await requireAdmin();

  if (!subject || !subject.trim()) {
    return { success: false, message: "Email subject cannot be empty.", sentCount: 0, failedCount: 0, errors: [] };
  }
  if (!htmlContent || !htmlContent.trim()) {
    return { success: false, message: "HTML content cannot be empty.", sentCount: 0, failedCount: 0, errors: [] };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    return {
      success: false,
      message: "RESEND_API_KEY is not set or valid in environment. Please add RESEND_API_KEY to .env.",
      sentCount: 0,
      failedCount: 0,
      errors: ["RESEND_API_KEY missing"],
    };
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "ForgeFlow AI <onboarding@resend.dev>";

  let recipients: string[] = [];

  if (recipientType === "watchlist") {
    const watchlist = await prisma.watchlist.findMany({
      where: { status: "active" },
      select: { email: true },
    });
    recipients = watchlist.map((w) => w.email);
  } else if (recipientType === "tenants") {
    try {
      const client = await clerkClient();
      const res = await client.users.getUserList({ limit: 500 });
      const users = Array.isArray(res) ? res : (res?.data ?? []);
      recipients = users
        .map((u) => u.emailAddresses[0]?.emailAddress)
        .filter((e): e is string => Boolean(e));
    } catch (err) {
      console.error("Failed to fetch Clerk tenant emails:", err);
    }
  } else if (recipientType === "selected_users") {
    if (selectedUserIds.length > 0) {
      try {
        const client = await clerkClient();
        const res = await client.users.getUserList({ userId: selectedUserIds, limit: 100 });
        const users = Array.isArray(res) ? res : (res?.data ?? []);
        recipients = users
          .map((u) => u.emailAddresses[0]?.emailAddress)
          .filter((e): e is string => Boolean(e));
      } catch (err) {
        console.error("Failed to fetch selected user emails:", err);
      }
    }
  } else if (recipientType === "custom") {
    if (!customEmails || !customEmails.trim()) {
      return { success: false, message: "Please specify custom recipient email address(es).", sentCount: 0, failedCount: 0, errors: [] };
    }
    recipients = customEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
  }

  // Remove duplicates and trim
  recipients = Array.from(new Set(recipients.map((r) => r.toLowerCase().trim())));

  if (recipients.length === 0) {
    return { success: false, message: "No valid recipient email addresses found.", sentCount: 0, failedCount: 0, errors: [] };
  }

  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  // Batching: process in chunks of 5 with 200ms rate-limit pause
  const chunkSize = 5;
  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (recipient) => {
        try {
          const unsubscribeUrl = `https://forgeflow.warishlabs.in/api/unsubscribe?email=${encodeURIComponent(recipient)}`;
          const finalHtml = `${htmlContent}
            <br/>
            <hr style="border:0;border-top:1px solid #1b2338;margin:24px 0;"/>
            <p style="font-size:11px;color:#5c6980;text-align:center;font-family:sans-serif;">
              You received this update from ForgeFlow AI. <a href="${unsubscribeUrl}" style="color:#38b6ff;text-decoration:underline;">Unsubscribe from future mailings</a>
            </p>`;

          const response = await resend.emails.send({
            from: fromEmail,
            to: recipient,
            subject: subject.trim(),
            html: finalHtml,
          });

          if (response.error) {
            failedCount++;
            errors.push(`${recipient}: ${response.error.message}`);
          } else {
            sentCount++;
          }
        } catch (err: any) {
          failedCount++;
          errors.push(`${recipient}: ${err.message || "Failed to send"}`);
        }
      })
    );

    if (i + chunkSize < recipients.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  await logAuditEventAction({
    userId: adminUserId,
    action: "ADMIN_ACTION",
    metadata: {
      type: "EMAIL_BROADCAST",
      subject: subject.trim(),
      recipientType,
      sentCount,
      failedCount,
      totalRecipients: recipients.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : null,
    },
  });

  return {
    success: sentCount > 0,
    message: `Broadcast completed: ${sentCount} sent, ${failedCount} failed out of ${recipients.length} recipients.`,
    sentCount,
    failedCount,
    errors,
  };
}
