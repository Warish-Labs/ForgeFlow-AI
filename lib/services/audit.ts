import { prisma } from "@/lib/db/prisma";

export type AuditActionType =
  | "PROJECT_CREATED"
  | "PROJECT_DELETED"
  | "AI_QUOTA_TRIGGERED"
  | "ADMIN_ACCESS"
  | "ADMIN_ACTION"
  | "DOCUMENT_GENERATED"
  | "DOCUMENT_EDITED";

export async function logAuditEventAction(params: {
  userId: string;
  projectId?: string | null;
  action: AuditActionType;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        projectId: params.projectId || null,
        action: params.action,
        metadata: params.metadata || {},
      },
    });
  } catch (err) {
    console.error("Failed to persist AuditLog:", err);
  }
}
