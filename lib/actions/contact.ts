"use server";

import { prisma } from "@/lib/db/prisma";
import { logAuditEventAction } from "@/lib/services/audit";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { requireAdmin } from "@/lib/auth/guard";
import { Resend } from "resend";

export interface ContactReplyItem {
  id: string;
  adminEmail: string;
  body: string;
  sentAt: string;
}

export interface ContactMessageWithReplies {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  replies: ContactReplyItem[];
}

export async function submitContactMessageAction(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken?: string;
}): Promise<{ success: boolean; message: string }> {
  const { name, email, subject, message, turnstileToken } = data;

  if (!name || !email || !subject || !message) {
    return { success: false, message: "Please fill out all required fields." };
  }

  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return { success: false, message: "Bot verification failed. Please try again." };
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();

  try {
    await prisma.contactMessage.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      },
    });

    await logAuditEventAction({
      userId: "anonymous",
      action: "ADMIN_ACTION",
      metadata: { type: "CONTACT_MESSAGE_SUBMIT", email: cleanEmail, subject: cleanSubject },
    });
  } catch (err) {
    console.error("[submitContactMessageAction] DB save error:", err);
  }

  // Attempt email dispatch via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey !== "re_placeholder_key") {
    try {
      const resend = new Resend(resendApiKey);
      const toEmail = process.env.CONTACT_FORM_TO_EMAIL || process.env.ADMIN_EMAIL_1 || "warishprojects@gmail.com";
      const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || "onboarding@resend.dev";

      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `[ForgeFlow Contact] ${cleanSubject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #070a14; color: #f3f6fc; border-radius: 8px;">
            <h2 style="color: #38b6ff;">New Contact Inquiry — ForgeFlow AI</h2>
            <p><strong>From:</strong> ${cleanName} (&lt;${cleanEmail}&gt;)</p>
            <p><strong>Subject:</strong> ${cleanSubject}</p>
            <hr style="border-color: #1b2338;" />
            <p style="white-space: pre-wrap;">${cleanMessage}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[submitContactMessageAction] Email dispatch error:", emailErr);
    }
  }

  return {
    success: true,
    message: "Thank you for reaching out! Your message has been received and our team will get back to you shortly.",
  };
}

export async function getContactMessagesAction(): Promise<ContactMessageWithReplies[]> {
  try {
    await requireAdmin();
    const messages = await prisma.contactMessage.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          orderBy: { sentAt: "asc" },
        },
      },
    });

    return messages.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      isRead: m.isRead,
      isDeleted: m.isDeleted,
      createdAt: m.createdAt.toLocaleString(),
      replies: m.replies.map((r) => ({
        id: r.id,
        adminEmail: r.adminEmail,
        body: r.body,
        sentAt: r.sentAt.toLocaleString(),
      })),
    }));
  } catch (err) {
    console.error("[getContactMessagesAction] error:", err);
    return [];
  }
}

export async function getUnreadMessageCountAction(): Promise<number> {
  try {
    await requireAdmin();
    return await prisma.contactMessage.count({
      where: { isRead: false, isDeleted: false },
    });
  } catch {
    return 0;
  }
}

export async function markMessageReadAction(messageId: string): Promise<{ success: boolean }> {
  try {
    await requireAdmin();
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (err) {
    console.error("[markMessageReadAction] error:", err);
    return { success: false };
  }
}

export async function toggleMessageReadAction(messageId: string, isRead: boolean): Promise<{ success: boolean }> {
  try {
    await requireAdmin();
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead },
    });
    return { success: true };
  } catch (err) {
    console.error("[toggleMessageReadAction] error:", err);
    return { success: false };
  }
}

export async function softDeleteMessageAction(messageId: string): Promise<{ success: boolean }> {
  try {
    await requireAdmin();
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });
    return { success: true };
  } catch (err) {
    console.error("[softDeleteMessageAction] error:", err);
    return { success: false };
  }
}

export async function sendContactReplyAction(data: {
  messageId: string;
  body: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const admin = await requireAdmin();

    const contactMsg = await prisma.contactMessage.findUnique({
      where: { id: data.messageId },
    });

    if (!contactMsg) {
      return { success: false, message: "Contact message not found." };
    }

    await prisma.contactReply.create({
      data: {
        contactMessageId: data.messageId,
        adminUserId: admin.userId,
        adminEmail: admin.email,
        body: data.body,
      },
    });

    await prisma.contactMessage.update({
      where: { id: data.messageId },
      data: { isRead: true },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== "re_placeholder_key") {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || "onboarding@resend.dev";

      await resend.emails.send({
        from: fromEmail,
        to: contactMsg.email,
        subject: `Re: ${contactMsg.subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #070a14; color: #f3f6fc; border-radius: 8px;">
            <h3 style="color: #38b6ff;">ForgeFlow AI Support Response</h3>
            <p>Dear ${contactMsg.name},</p>
            <p style="white-space: pre-wrap;">${data.body}</p>
            <hr style="border-color: #1b2338;" />
            <p style="font-size: 11px; color: #9aa4b8;">ForgeFlow AI — Architectural Intelligence Platform</p>
          </div>
        `,
      });
    }

    return { success: true, message: "Reply dispatched via email successfully!" };
  } catch (err: any) {
    console.error("[sendContactReplyAction] error:", err);
    return { success: false, message: err?.message || "Failed to send reply." };
  }
}
