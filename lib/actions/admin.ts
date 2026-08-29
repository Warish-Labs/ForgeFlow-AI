"use server";

/**
 * lib/actions/admin.ts
 *
 * All admin server actions — gated by requireAdmin() at the top of each function.
 * Never relies on UI hiding for security — every function enforces admin check server-side.
 */

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { ERROR_CODES, PLAN_LIMITS } from "@/lib/config/plans";
import { logAuditEventAction } from "@/lib/services/audit";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUserInfo {
  userId: string;
  fullName: string;
  email: string;
  imageUrl: string;
}

export interface WatchlistSubscriberInfo {
  id: string;
  email: string;
  source: string;
  status: string;
  createdAt: string;
}

export interface AdminMetricsResult {
  overview: {
    totalUsers: number; totalProjects: number; totalTokens: number;
    tokensToday: number; tokensThisMonth: number; totalRequests: number;
    requestsToday: number; requestsThisMonth: number;
    successRatePercent: number; failedRequests: number;
    totalWatchlistSubscribers: number;
    totalDocuments: number;
    totalContactMessages: number;
  };
  providers: { provider: string; totalTokens: number; totalRequests: number }[];
  operations: { operation: string; totalTokens: number; totalRequests: number }[];
  models: { model: string; provider: string; totalTokens: number; totalRequests: number }[];
  userTable: {
    userId: string; fullName: string; email: string; imageUrl: string;
    role: "SUPER_ADMIN" | "USER"; createdAt: string;
    plan: string; projectsCount: number; documentsCount: number; tokensUsed: number;
    remainingTokens: number; requestsCount: number; lastActive: string;
    status: "healthy" | "warning" | "critical" | "exhausted";
  }[];
  recentLogs: {
    id: string; userId: string; projectId: string | null; operation: string;
    provider: string; model: string | null; totalTokens: number;
    durationMs: number; status: string; createdAt: string;
  }[];
  auditLogs: {
    id: string; userId: string; projectId: string | null;
    action: string; metadata: unknown; createdAt: string;
  }[];
  watchlistSubscribers: WatchlistSubscriberInfo[];
}

// ─── Overview Metrics ─────────────────────────────────────────────────────────

// ─── Overview Metrics ─────────────────────────────────────────────────────────

export async function getAdminMetricsAction(): Promise<AdminMetricsResult> {
  const { userId: adminUserId } = await requireAdmin();
  if (adminUserId) {
    await logAuditEventAction({ userId: adminUserId, action: "ADMIN_ACCESS", metadata: { page: "/admin" } }).catch(() => {});
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProjects, totalLogs, successfulLogs, failedRequests,
      totalTokensAgg, todayAgg, monthAgg,
      providerGroups, operationGroups, modelGroups,
      userProjectsGroup, userUsageGroup,
      totalDocuments, totalContactMessages, dbUsers,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.aiUsageLog.count(),
      prisma.aiUsageLog.count({ where: { status: "success" } }),
      prisma.aiUsageLog.count({ where: { status: { in: ["error", "quota_exceeded"] } } }),
      prisma.aiUsageLog.aggregate({ _sum: { totalTokens: true } }),
      prisma.aiUsageLog.aggregate({ where: { createdAt: { gte: startOfToday } }, _sum: { totalTokens: true }, _count: { id: true } }),
      prisma.aiUsageLog.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { totalTokens: true }, _count: { id: true } }),
      prisma.aiUsageLog.groupBy({ by: ["provider"], _sum: { totalTokens: true }, _count: { id: true } }),
      prisma.aiUsageLog.groupBy({ by: ["operation"], _sum: { totalTokens: true }, _count: { id: true } }),
      prisma.aiUsageLog.groupBy({ by: ["model", "provider"], _sum: { totalTokens: true }, _count: { id: true } }),
      prisma.project.groupBy({ by: ["ownerId"], _count: { id: true } }),
      prisma.aiUsageLog.groupBy({ by: ["userId"], _sum: { totalTokens: true }, _count: { id: true }, _max: { createdAt: true } }),
      prisma.document.count(),
      prisma.contactMessage.count({ where: { isDeleted: false } }),
      prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } }).catch(() => []),
    ]);

    const successRatePercent = totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 100;
    const totalTokens = totalTokensAgg._sum.totalTokens || 0;

    const allUserIdsSet = new Set<string>();
    dbUsers.forEach((u) => u.id && allUserIdsSet.add(u.id));
    userProjectsGroup.forEach((u) => u.ownerId && allUserIdsSet.add(u.ownerId));
    userUsageGroup.forEach((u) => u.userId && allUserIdsSet.add(u.userId));

    // Fetch all Clerk users directly to capture newly registered accounts
    const clerkUsers: Record<string, AdminUserInfo> = {};
    try {
      const client = await clerkClient();
      const res = await client.users.getUserList({ limit: 100 });
      const users = Array.isArray(res) ? res : (res?.data ?? []);
      for (const u of users) {
        allUserIdsSet.add(u.id);
        const email = u.emailAddresses[0]?.emailAddress || "";
        const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") ||
          (email ? email.split("@")[0] : u.id.substring(0, 12));
        clerkUsers[u.id] = {
          userId: u.id,
          fullName,
          email,
          imageUrl: u.imageUrl || "",
        };
      }
    } catch (err) {
      console.error("[getAdminMetricsAction] Clerk getUserList error:", err);
    }

    const allUserIds = Array.from(allUserIdsSet);
    const maxTokens = PLAN_LIMITS.FREE.aiTokenLimit;
    const dbUserMap = new Map(dbUsers.map((u) => [u.id, u]));

    const userTable = allUserIds.map((uId) => {
      const proj = userProjectsGroup.find((p) => p.ownerId === uId);
      const usage = userUsageGroup.find((u) => u.userId === uId);
      const dbUser = dbUserMap.get(uId);
      const clerk = clerkUsers[uId];

      const email = clerk?.email || dbUser?.email || "";
      const isSuperAdmin = dbUser?.role === "SUPER_ADMIN" || (email && ["warishlabs@gmail.com", "warishdeveloper@gmail.com", "admin@warishlabs.in"].includes(email.toLowerCase()));

      const tokensUsed = usage?._sum.totalTokens || 0;
      const remainingTokens = Math.max(0, maxTokens - tokensUsed);
      const percent = (tokensUsed / maxTokens) * 100;
      let status: "healthy" | "warning" | "critical" | "exhausted" = "healthy";
      if (tokensUsed >= maxTokens) status = "exhausted";
      else if (percent >= 90) status = "critical";
      else if (percent >= 75) status = "warning";

      return {
        userId: uId,
        fullName: clerk?.fullName || (email ? email.split("@")[0] : uId.substring(0, 14) + "..."),
        email,
        imageUrl: clerk?.imageUrl || "",
        role: (isSuperAdmin ? "SUPER_ADMIN" : "USER") as "SUPER_ADMIN" | "USER",
        createdAt: dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString() : "N/A",
        plan: isSuperAdmin ? "ADMIN" : "FREE",
        projectsCount: proj?._count.id || 0,
        documentsCount: 0,
        tokensUsed,
        remainingTokens,
        requestsCount: usage?._count.id || 0,
        lastActive: usage?._max.createdAt ? new Date(usage._max.createdAt).toLocaleString() : "N/A",
        status,
      };
    });

    let watchlistEntries: Array<{ id: string; email: string; source: string; status: string; createdAt: Date }> = [];
    try {
      watchlistEntries = await prisma.watchlist.findMany({ orderBy: { createdAt: "desc" } });
    } catch (_) {}

    const watchlistSubscribers: WatchlistSubscriberInfo[] = watchlistEntries.map((w) => ({
      id: w.id,
      email: w.email,
      source: w.source,
      status: w.status,
      createdAt: new Date(w.createdAt).toLocaleString(),
    }));

    const logs = await prisma.aiUsageLog.findMany({ take: 50, orderBy: { createdAt: "desc" } }).catch(() => []);
    const recentLogs = logs.map((l) => ({
      id: l.id, userId: l.userId, projectId: l.projectId, operation: l.operation,
      provider: l.provider, model: l.model, totalTokens: l.totalTokens,
      durationMs: l.durationMs, status: l.status,
      createdAt: new Date(l.createdAt).toLocaleString(),
    }));

    const auditEntries = await prisma.auditLog.findMany({ take: 30, orderBy: { createdAt: "desc" } }).catch(() => []);
    const auditLogs = auditEntries.map((a) => ({
      id: a.id, userId: a.userId, projectId: a.projectId, action: a.action,
      metadata: JSON.parse(JSON.stringify(a.metadata || {})),
      createdAt: new Date(a.createdAt).toLocaleString(),
    }));

    return {
      overview: {
        totalUsers: allUserIds.length,
        totalProjects,
        totalTokens,
        tokensToday: todayAgg._sum.totalTokens || 0,
        tokensThisMonth: monthAgg._sum.totalTokens || 0,
        totalRequests: totalLogs,
        requestsToday: todayAgg._count.id || 0,
        requestsThisMonth: monthAgg._count.id || 0,
        successRatePercent,
        failedRequests,
        totalWatchlistSubscribers: watchlistEntries.length,
        totalDocuments,
        totalContactMessages,
      },
      providers: providerGroups.map((g) => ({ provider: g.provider, totalTokens: g._sum.totalTokens || 0, totalRequests: g._count.id })),
      operations: operationGroups.map((g) => ({ operation: g.operation, totalTokens: g._sum.totalTokens || 0, totalRequests: g._count.id })),
      models: modelGroups.map((g) => ({ model: g.model || "default", provider: g.provider, totalTokens: g._sum.totalTokens || 0, totalRequests: g._count.id })),
      userTable,
      recentLogs,
      auditLogs,
      watchlistSubscribers,
    };
  } catch (err) {
    console.error("[getAdminMetricsAction] Unhandled error while computing admin metrics:", err);
    return {
      overview: {
        totalUsers: 0, totalProjects: 0, totalTokens: 0, tokensToday: 0, tokensThisMonth: 0,
        totalRequests: 0, requestsToday: 0, requestsThisMonth: 0, successRatePercent: 100,
        failedRequests: 0, totalWatchlistSubscribers: 0, totalDocuments: 0, totalContactMessages: 0,
      },
      providers: [], operations: [], models: [], userTable: [], recentLogs: [], auditLogs: [], watchlistSubscribers: [],
    };
  }
}

// ─── User Detail ──────────────────────────────────────────────────────────────

export async function getAdminUserDetailsAction(targetUserId: string) {
  await requireAdmin();

  const [projects, aiLogs, errors, totalTokensAgg] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: targetUserId },
      include: { _count: { select: { features: true, decisions: true, roadmapItems: true, documents: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.aiUsageLog.findMany({ where: { userId: targetUserId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.aiUsageLog.findMany({ where: { userId: targetUserId, status: { in: ["error", "quota_exceeded"] } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.aiUsageLog.aggregate({ where: { userId: targetUserId }, _sum: { promptTokens: true, completionTokens: true, totalTokens: true }, _count: { id: true } }),
  ]);

  let clerkUser: AdminUserInfo | null = null;
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(targetUserId);
    clerkUser = {
      userId: u.id,
      fullName: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.emailAddresses[0]?.emailAddress || u.id,
      email: u.emailAddresses[0]?.emailAddress || "",
      imageUrl: u.imageUrl || "",
    };
  } catch (_) {}

  return {
    userId: targetUserId,
    clerkUser,
    projects,
    aiLogs: aiLogs.map((l) => ({ ...l, createdAt: new Date(l.createdAt).toLocaleString() })),
    errors: errors.map((e) => ({ ...e, createdAt: new Date(e.createdAt).toLocaleString() })),
    stats: {
      promptTokens: totalTokensAgg._sum.promptTokens || 0,
      completionTokens: totalTokensAgg._sum.completionTokens || 0,
      totalTokens: totalTokensAgg._sum.totalTokens || 0,
      totalRequests: totalTokensAgg._count.id || 0,
    },
  };
}

// ─── Project Detail ───────────────────────────────────────────────────────────

export async function getAdminProjectDetailsAction(projectId: string) {
  await requireAdmin();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      features: true,
      decisions: true,
      roadmapItems: true,
      documents: { select: { id: true, type: true, title: true, version: true, status: true, createdAt: true } },
      aiUsage: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) return null;

  return {
    ...project,
    createdAt: new Date(project.createdAt).toLocaleString(),
    updatedAt: new Date(project.updatedAt).toLocaleString(),
  };
}

// ─── Force Password Reset ────────────────────────────────────────────────────

export async function forcePasswordResetAction(
  targetUserId: string
): Promise<{ success: boolean; message: string }> {
  const { userId: adminId, email: adminEmail } = await requireAdmin();

  try {
    const client = await clerkClient();

    // Reset all active sessions for the user
    const sessions = await client.sessions.getSessionList({ userId: targetUserId });
    await Promise.all(
      sessions.data.map((s) => client.sessions.revokeSession(s.id))
    );

    // Write audit log
    await logAuditEventAction({
      userId: adminId,
      action: "ADMIN_ACTION",
      metadata: {
        action: "FORCE_PASSWORD_RESET",
        targetUserId,
        performedBy: adminEmail,
      },
    });

    return {
      success: true,
      message: `All sessions revoked for user ${targetUserId}. They must log in again and can reset their password via the sign-in page.`,
    };
  } catch (err) {
    console.error("[forcePasswordResetAction] Error:", err);
    return { success: false, message: "Failed to revoke user sessions. Check server logs." };
  }
}

// ─── Toggle User Ban ──────────────────────────────────────────────────────────

export async function toggleUserBanAction(
  targetUserId: string,
  ban: boolean
): Promise<{ success: boolean; message: string }> {
  const { userId: adminId, email: adminEmail } = await requireAdmin();

  try {
    const client = await clerkClient();
    if (ban) {
      await client.users.banUser(targetUserId);
    } else {
      await client.users.unbanUser(targetUserId);
    }

    await logAuditEventAction({
      userId: adminId,
      action: "ADMIN_ACTION",
      metadata: {
        action: ban ? "USER_BANNED" : "USER_UNBANNED",
        targetUserId,
        performedBy: adminEmail,
      },
    });

    return { success: true, message: `User ${ban ? "banned" : "unbanned"} successfully.` };
  } catch (err) {
    console.error("[toggleUserBanAction] Error:", err);
    return { success: false, message: "Failed to update user status." };
  }
}

// ─── Get All Documents (admin view) ──────────────────────────────────────────

export async function getAdminDocumentsAction() {
  await requireAdmin();

  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        project: { select: { name: true, ownerId: true } },
      },
    });

    const ownerIds = Array.from(new Set(docs.map((d) => d.project?.ownerId).filter((id): id is string => Boolean(id))));
    const clerkUsers: Record<string, { fullName: string; email: string }> = {};
    const validClerkOwnerIds = ownerIds.filter((id) => id.startsWith("user_"));

    if (validClerkOwnerIds.length > 0) {
      try {
        const client = await clerkClient();
        const res = await client.users.getUserList({ userId: validClerkOwnerIds, limit: 100 });
        const users = Array.isArray(res) ? res : (res?.data ?? []);
        for (const u of users) {
          clerkUsers[u.id] = {
            fullName: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.emailAddresses[0]?.emailAddress?.split("@")[0] || u.id.substring(0, 12),
            email: u.emailAddresses[0]?.emailAddress || "",
          };
        }
      } catch (err) {
        console.error("[getAdminDocumentsAction] Clerk getUserList error:", err);
      }
    }

    return docs.map((d) => {
      const ownerId = d.project?.ownerId || "unknown";
      const ownerClerk = clerkUsers[ownerId];
      return {
        id: d.id,
        projectId: d.projectId,
        projectName: d.project?.name || "Deleted Project",
        ownerId,
        creatorName: ownerClerk?.fullName || (ownerId.startsWith("user_") ? ownerId.substring(0, 14) + "..." : "System User"),
        creatorEmail: ownerClerk?.email || "",
        type: d.type,
        title: d.title,
        status: d.status,
        version: d.version,
        contentPreview: d.content ? d.content.substring(0, 200) : "",
        content: d.content || "",
        createdAt: new Date(d.createdAt).toLocaleString(),
      };
    });
  } catch (err) {
    console.error("[getAdminDocumentsAction] Error fetching documents:", err);
    return [];
  }
}

// ─── Model Pricing ────────────────────────────────────────────────────────────

const ModelPricingSchema = z.object({
  model: z.string().min(1),
  provider: z.string().min(1),
  inputPricePer1mTokens: z.number().nonnegative().max(1000),
  outputPricePer1mTokens: z.number().nonnegative().max(1000),
});

export async function getModelPricingAction() {
  await requireAdmin();

  try {
    const pricing = await prisma.modelPricing.findMany({
      orderBy: { effectiveFrom: "desc" },
    });

    return pricing.map((p) => ({
      id: p.id,
      model: p.model,
      provider: p.provider,
      inputPricePer1mTokens: p.inputPricePer1mTokens,
      outputPricePer1mTokens: p.outputPricePer1mTokens,
      effectiveFrom: new Date(p.effectiveFrom).toLocaleString(),
      createdAt: new Date(p.createdAt).toLocaleString(),
    }));
  } catch (err) {
    console.error("[getModelPricingAction] Error fetching pricing:", err);
    return [];
  }
}

export async function upsertModelPricingAction(input: {
  model: string;
  provider: string;
  inputPricePer1mTokens: number;
  outputPricePer1mTokens: number;
}): Promise<{ success: boolean; message: string }> {
  const { userId: adminId, email: adminEmail } = await requireAdmin();

  const parsed = ModelPricingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.modelPricing.create({
      data: {
        ...parsed.data,
        createdByAdminId: adminId,
      },
    });

    await logAuditEventAction({
      userId: adminId,
      action: "ADMIN_ACTION",
      metadata: {
        action: "MODEL_PRICING_UPDATED",
        ...parsed.data,
        performedBy: adminEmail,
      },
    });

    return { success: true, message: "Pricing updated successfully." };
  } catch (err) {
    console.error("[upsertModelPricingAction] Error:", err);
    return { success: false, message: "Failed to save pricing." };
  }
}
