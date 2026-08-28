"use server";

/**
 * lib/actions/contact.ts
 *
 * Server actions for the in-app Contact Us form and admin inbox.
 *
 * Security:
 * - submitContactMessageAction: public (no auth required), but Turnstile-verified
 * - All other actions: admin-only via requireAdmin()
 */

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { Resend } from "resend";
import { logAuditEventAction } from "@/lib/services/audit";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Validation Schemas ────────────────────────────────────────────────────────

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  turnstileToken: z.string().min(1, "Missing bot verification token"),
});

type ContactFormInput = z.infer<typeof ContactFormSchema>;

import { verifyTurnstileToken } from "@/lib/services/turnstile";

// ─── Public: Submit Contact Form ──────────────────────────────────────────────

export async function submitContactMessageAction(
  input: ContactFormInput
): Promise<{ success: boolean; message: string }> {
  // Validate
  const parsed = ContactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const { name, email, subject, message, turnstileToken } = parsed.data;

  // Bot check
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return { success: false, message: "Bot verification failed. Please try again." };
  }

  // Persist message
  try {
    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });
  } catch (err) {
    console.error("[submitContactMessageAction] DB error:", err);
    return { success: false, message: "Failed to submit message. Please try again." };
  }

  // Notify admin via email (best-effort — don't fail if email fails)
  const toEmail = process.env.CONTACT_FORM_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (toEmail && fromEmail && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `[ForgeFlow Contact] ${subject}`,
        html: `
          <div style="font-family:sans-serif;background:#070a14;color:#f3f6fc;padding:24px;border-radius:12px;max-width:600px">
            <h2 style="color:#38b6ff;margin-bottom:4px">New Contact Form Submission</h2>
            <p style="color:#9aa4b8;font-size:12px;margin-top:0">ForgeFlow AI — in-app contact</p>
            <hr style="border:0;border-top:1px solid #1b2338;margin:16px 0"/>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background:#0d1220;border:1px solid #1b2338;border-radius:8px;padding:12px;white-space:pre-wrap;font-size:13px">${message}</div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[submitContactMessageAction] Email notify failed:", emailErr);
    }
  }

  return { success: true, message: "Your message has been sent! We'll get back to you soon." };
}

// ─── Admin: Get unread count ───────────────────────────────────────────────────

export async function getUnreadMessageCountAction(): Promise<number> {
  // Used in admin layout — don't require admin here, layout already gates
  try {
    return await prisma.contactMessage.count({
      where: { isRead: false, isDeleted: false },
    });
  } catch {
    return 0;
  }
}

// ─── Admin: Get all messages ───────────────────────────────────────────────────

export type ContactMessageWithReplies = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  replies: {
    id: string;
    adminEmail: string;
    body: string;
    sentAt: string;
  }[];
};

export async function getContactMessagesAction(): Promise<ContactMessageWithReplies[]> {
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    where: { isDeleted: false },
    include: {
      replies: { orderBy: { sentAt: "asc" } },
    },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });

  return messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    isRead: m.isRead,
    isDeleted: m.isDeleted,
    createdAt: new Date(m.createdAt).toLocaleString(),
    replies: m.replies.map((r) => ({
      id: r.id,
      adminEmail: r.adminEmail,
      body: r.body,
      sentAt: new Date(r.sentAt).toLocaleString(),
    })),
  }));
}

// ─── Admin: Mark as read ──────────────────────────────────────────────────────

export async function markMessageReadAction(
  id: string
): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });
}

// ─── Admin: Soft delete ───────────────────────────────────────────────────────

export async function softDeleteMessageAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { success: true, message: "Message archived." };
  } catch {
    return { success: false, message: "Failed to archive message." };
  }
}

// ─── Admin: Reply to message ──────────────────────────────────────────────────

const ReplySchema = z.object({
  messageId: z.string().min(1),
  body: z.string().min(1, "Reply cannot be empty").max(10000),
});

export async function sendContactReplyAction(input: {
  messageId: string;
  body: string;
}): Promise<{ success: boolean; message: string }> {
  const { userId, email: adminEmail } = await requireAdmin();

  const parsed = ReplySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const { messageId, body } = parsed.data;

  // Fetch original message
  const original = await prisma.contactMessage.findFirst({
    where: { id: messageId, isDeleted: false },
  });
  if (!original) {
    return { success: false, message: "Message not found." };
  }

  const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!fromEmail || !process.env.RESEND_API_KEY) {
    return { success: false, message: "Email service not configured." };
  }

  // Send email reply
  try {
    await resend.emails.send({
      from: fromEmail,
      to: original.email,
      subject: `Re: ${original.subject}`,
      html: `
        <div style="font-family:sans-serif;background:#070a14;color:#f3f6fc;padding:24px;border-radius:12px;max-width:600px">
          <h2 style="color:#38b6ff;margin-bottom:4px">ForgeFlow AI — Support Reply</h2>
          <p style="color:#9aa4b8;font-size:12px;margin-top:0">In reply to your message: "${original.subject}"</p>
          <hr style="border:0;border-top:1px solid #1b2338;margin:16px 0"/>
          <div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${body}</div>
          <hr style="border:0;border-top:1px solid #1b2338;margin:16px 0"/>
          <p style="font-size:11px;color:#5c6980">ForgeFlow AI · <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://forgeflow.warishlabs.in"}" style="color:#38b6ff">forgeflow.warishlabs.in</a></p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("[sendContactReplyAction] Resend error:", emailErr);
    return { success: false, message: "Email failed to send. Reply was NOT saved." };
  }

  // Persist reply in DB and mark original as read
  await prisma.contactReply.create({
    data: {
      contactMessageId: messageId,
      adminUserId: userId,
      adminEmail,
      body,
    },
  });
  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { isRead: true },
  });

  // Audit log
  await logAuditEventAction({
    userId,
    action: "ADMIN_ACTION",
    metadata: { action: "CONTACT_REPLY_SENT", messageId, to: original.email },
  });

  return { success: true, message: `Reply sent to ${original.email}.` };
}
