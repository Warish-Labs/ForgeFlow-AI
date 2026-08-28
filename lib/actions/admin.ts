"use server";
import { prisma } from "@/lib/db/prisma";
import { checkIsSuperAdminAction } from "@/lib/auth/admin";
import { ERROR_CODES, PLAN_LIMITS } from "@/lib/config/plans";
import { logAuditEventAction } from "@/lib/services/audit";
import { clerkClient } from "@clerk/nextjs/server";

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
  };
  providers: { provider: string; totalTokens: number; totalRequests: number }[];
  operations: { operation: string; totalTokens: number; totalRequests: number }[];
  models: { model: string; provider: string; totalTokens: number; totalRequests: number }[];
  userTable: {
    userId: string; fullName: string; email: string; imageUrl: string;
    plan: string; projectsCount: number; tokensUsed: number;
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

export async function getAdminMetricsAction(): Promise<AdminMetricsResult> {
  const { isAdmin, userId: adminUserId } = await checkIsSuperAdminAction();
  if (!isAdmin) throw new Error(ERROR_CODES.UNAUTHORIZED_ADMIN);
  if (adminUserId) {
    await logAuditEventAction({ userId: adminUserId, action: "ADMIN_ACCESS", metadata: { page: "/admin" } });
  }
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalProjects = await prisma.project.count();
  const totalLogs = await prisma.aiUsageLog.count();
  const successfulLogs = await prisma.aiUsageLog.count({ where: { status: "success" } });
  const failedRequests = await prisma.aiUsageLog.count({ where: { status: { in: ["error", "quota_exceeded"] } } });
  const totalTokensAgg = await prisma.aiUsageLog.aggregate({ _sum: { totalTokens: true } });
  const totalTokens = totalTokensAgg._sum.totalTokens || 0;
  const todayAgg = await prisma.aiUsageLog.aggregate({ where: { createdAt: { gte: startOfToday } }, _sum: { totalTokens: true }, _count: { id: true } });
  const monthAgg = await prisma.aiUsageLog.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { totalTokens: true }, _count: { id: true } });
  const successRatePercent = totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 100;
  const providerGroups = await prisma.aiUsageLog.groupBy({ by: ["provider"], _sum: { totalTokens: true }, _count: { id: true } });
  const operationGroups = await prisma.aiUsageLog.groupBy({ by: ["operation"], _sum: { totalTokens: true }, _count: { id: true } });
  const modelGroups = await prisma.aiUsageLog.groupBy({ by: ["model", "provider"], _sum: { totalTokens: true }, _count: { id: true } });
  const userProjectsGroup = await prisma.project.groupBy({ by: ["ownerId"], _count: { id: true } });
  const userUsageGroup = await prisma.aiUsageLog.groupBy({ by: ["userId"], _sum: { totalTokens: true }, _count: { id: true }, _max: { createdAt: true } });
  const allUserIds = Array.from(new Set([...userProjectsGroup.map((u) => u.ownerId), ...userUsageGroup.map((u) => u.userId)])).filter((id): id is string => Boolean(id));
  const maxTokens = PLAN_LIMITS.FREE.aiTokenLimit;
  
  // Fetch Clerk user info only if valid IDs exist
  const clerkUsers: Record<string, AdminUserInfo> = {};
  if (allUserIds.length > 0) {
    try {
      const client = await clerkClient();
      const { data: users } = await client.users.getUserList({ userId: allUserIds, limit: 100 });
      for (const u of users) {
        clerkUsers[u.id] = {
          userId: u.id,
          fullName: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.emailAddresses[0]?.emailAddress?.split("@")[0] || u.id.substring(0, 12),
          email: u.emailAddresses[0]?.emailAddress || "",
          imageUrl: u.imageUrl || "",
        };
      }
    } catch (_) {}
  }

  const userTable = allUserIds.map((uId) => {
    const proj = userProjectsGroup.find((p) => p.ownerId === uId);
    const usage = userUsageGroup.find((u) => u.userId === uId);
    const tokensUsed = usage?._sum.totalTokens || 0;
    const remainingTokens = Math.max(0, maxTokens - tokensUsed);
    const percent = (tokensUsed / maxTokens) * 100;
    let status: "healthy" | "warning" | "critical" | "exhausted" = "healthy";
    if (tokensUsed >= maxTokens) status = "exhausted";
    else if (percent >= 90) status = "critical";
    else if (percent >= 75) status = "warning";
    const clerk = clerkUsers[uId];
    return {
      userId: uId,
      fullName: clerk?.fullName || uId.substring(0, 14) + "...",
      email: clerk?.email || "",
      imageUrl: clerk?.imageUrl || "",
      plan: "FREE", projectsCount: proj?._count.id || 0, tokensUsed, remainingTokens,
      requestsCount: usage?._count.id || 0,
      lastActive: usage?._max.createdAt ? new Date(usage._max.createdAt).toLocaleString() : "N/A",
      status,
    };
  });

  const watchlistDelegate = (prisma as any).watchlist;
  const watchlistEntries = watchlistDelegate ? await watchlistDelegate.findMany({ orderBy: { createdAt: "desc" } }) : [];
  const watchlistSubscribers = watchlistEntries.map((w: any) => ({
    id: w.id,
    email: w.email,
    source: w.source,
    status: w.status,
    createdAt: new Date(w.createdAt).toLocaleString(),
  }));

  const logs = await prisma.aiUsageLog.findMany({ take: 50, orderBy: { createdAt: "desc" } });
  const recentLogs = logs.map((l) => ({ id: l.id, userId: l.userId, projectId: l.projectId, operation: l.operation, provider: l.provider, model: l.model, totalTokens: l.totalTokens, durationMs: l.durationMs, status: l.status, createdAt: new Date(l.createdAt).toLocaleString() }));
  const auditEntries = await prisma.auditLog.findMany({ take: 30, orderBy: { createdAt: "desc" } });
  const auditLogs = auditEntries.map((a) => ({
    id: a.id,
    userId: a.userId,
    projectId: a.projectId,
    action: a.action,
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
    },
    providers: providerGroups.map((g) => ({ provider: g.provider, totalTokens: g._sum.totalTokens || 0, totalRequests: g._count.id })),
    operations: operationGroups.map((g) => ({ operation: g.operation, totalTokens: g._sum.totalTokens || 0, totalRequests: g._count.id })),
    models: modelGroups.map((g) => ({ model: g.model || "default", provider: g.provider, totalTokens: g._sum.totalTokens || 0, totalRequests: g._count.id })),
    userTable,
    recentLogs,
    auditLogs,
    watchlistSubscribers,
  };
}

export async function getAdminUserDetailsAction(targetUserId: string) {
  const { isAdmin } = await checkIsSuperAdminAction();
  if (!isAdmin) throw new Error(ERROR_CODES.UNAUTHORIZED_ADMIN);
  const projects = await prisma.project.findMany({ where: { ownerId: targetUserId }, include: { _count: { select: { features: true, decisions: true, roadmapItems: true, documents: true } } }, orderBy: { updatedAt: "desc" } });
  const aiLogs = await prisma.aiUsageLog.findMany({ where: { userId: targetUserId }, orderBy: { createdAt: "desc" }, take: 20 });
  const errors = await prisma.aiUsageLog.findMany({ where: { userId: targetUserId, status: { in: ["error", "quota_exceeded"] } }, orderBy: { createdAt: "desc" }, take: 10 });
  const totalTokensAgg = await prisma.aiUsageLog.aggregate({ where: { userId: targetUserId }, _sum: { promptTokens: true, completionTokens: true, totalTokens: true }, _count: { id: true } });
  let clerkUser: AdminUserInfo | null = null;
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(targetUserId);
    clerkUser = { userId: u.id, fullName: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.emailAddresses[0]?.emailAddress || u.id, email: u.emailAddresses[0]?.emailAddress || "", imageUrl: u.imageUrl || "" };
  } catch (_) {}
  return { userId: targetUserId, clerkUser, projects, aiLogs: aiLogs.map((l) => ({ ...l, createdAt: new Date(l.createdAt).toLocaleString() })), errors: errors.map((e) => ({ ...e, createdAt: new Date(e.createdAt).toLocaleString() })), stats: { promptTokens: totalTokensAgg._sum.promptTokens || 0, completionTokens: totalTokensAgg._sum.completionTokens || 0, totalTokens: totalTokensAgg._sum.totalTokens || 0, totalRequests: totalTokensAgg._count.id || 0 } };
}

export async function getAdminProjectDetailsAction(projectId: string) {
  const { isAdmin } = await checkIsSuperAdminAction();
  if (!isAdmin) throw new Error(ERROR_CODES.UNAUTHORIZED_ADMIN);
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { features: true, decisions: true, roadmapItems: true, documents: { select: { id: true, type: true, title: true, version: true, status: true, createdAt: true } }, aiUsage: { orderBy: { createdAt: "desc" }, take: 20 } } });
  if (!project) return null;
  return { ...project, createdAt: new Date(project.createdAt).toLocaleString(), updatedAt: new Date(project.updatedAt).toLocaleString() };
}
