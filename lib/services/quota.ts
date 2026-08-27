import { prisma } from "@/lib/db/prisma";
import { PLAN_LIMITS, ERROR_CODES } from "@/lib/config/plans";
import { checkIsSuperAdminAction } from "@/lib/auth/admin";
import { logAuditEventAction } from "@/lib/services/audit";

export interface QuotaUsageResult {
  isAdmin?: boolean;
  projectsCount: number;
  maxProjects: number;
  totalTokens: number;
  maxTokens: number;
  totalRequests: number;
  maxRequests: number;
  remainingTokens: number;
  remainingRequests: number;
  resetDate: string;
  isExhausted: boolean;
  status: "healthy" | "warning" | "critical" | "exhausted";
}

export async function getUserQuotaUsageAction(userId: string): Promise<QuotaUsageResult> {
  const maxProjects = PLAN_LIMITS.FREE.maxProjects;
  const maxTokens = PLAN_LIMITS.FREE.aiTokenLimit;
  const maxRequests = PLAN_LIMITS.FREE.aiRequestLimit;

  // Projects count
  const projectsCount = await prisma.project.count({
    where: { ownerId: userId },
  });

  // Calculate calendar month start
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Aggregate AI Usage
  const usageAggregate = await prisma.aiUsageLog.aggregate({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      totalTokens: true,
    },
    _count: {
      id: true,
    },
  });

  const totalTokens = usageAggregate._sum.totalTokens || 0;
  const totalRequests = usageAggregate._count.id || 0;

  const remainingTokens = Math.max(0, maxTokens - totalTokens);
  const remainingRequests = Math.max(0, maxRequests - totalRequests);

  const tokenUsagePercent = (totalTokens / maxTokens) * 100;
  const isExhausted = totalTokens >= maxTokens || totalRequests >= maxRequests;

  let status: "healthy" | "warning" | "critical" | "exhausted" = "healthy";
  if (isExhausted) {
    status = "exhausted";
  } else if (tokenUsagePercent >= 90) {
    status = "critical";
  } else if (tokenUsagePercent >= 75) {
    status = "warning";
  }

  // Next month reset date format (e.g., "1st of next month")
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const resetDate = nextMonth.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const { isAdmin } = await checkIsSuperAdminAction();

  return {
    isAdmin,
    projectsCount,
    maxProjects: isAdmin ? 999 : maxProjects,
    totalTokens,
    maxTokens: isAdmin ? 10000000 : maxTokens,
    totalRequests,
    maxRequests: isAdmin ? 999999 : maxRequests,
    remainingTokens: isAdmin ? 10000000 : remainingTokens,
    remainingRequests: isAdmin ? 999999 : remainingRequests,
    resetDate,
    isExhausted: isAdmin ? false : isExhausted,
    status: isAdmin ? "healthy" : status,
  };
}

export async function checkUserCanCreateProjectAction(userId: string) {
  const { isAdmin } = await checkIsSuperAdminAction();
  if (isAdmin) {
    return { allowed: true, isAdmin: true };
  }

  const usage = await getUserQuotaUsageAction(userId);
  if (usage.projectsCount >= usage.maxProjects) {
    await logAuditEventAction({
      userId,
      action: "AI_QUOTA_TRIGGERED",
      metadata: { reason: "PROJECT_LIMIT_EXCEEDED", projectsCount: usage.projectsCount, maxProjects: usage.maxProjects },
    });
    return {
      allowed: false,
      error: {
        code: ERROR_CODES.FREE_PROJECT_LIMIT_REACHED,
        message: `Free tier is limited to ${usage.maxProjects} project. Please upgrade to Premium for unlimited projects.`,
      },
    };
  }
  return { allowed: true };
}

export async function checkUserAiQuotaAction(userId: string) {
  const { isAdmin } = await checkIsSuperAdminAction();
  if (isAdmin) {
    return { allowed: true, isAdmin: true };
  }

  const usage = await getUserQuotaUsageAction(userId);
  if (usage.isExhausted) {
    await logAuditEventAction({
      userId,
      action: "AI_QUOTA_TRIGGERED",
      metadata: { reason: "AI_QUOTA_EXCEEDED", totalTokens: usage.totalTokens, maxTokens: usage.maxTokens },
    });
    return {
      allowed: false,
      error: {
        code: ERROR_CODES.FREE_AI_QUOTA_EXCEEDED,
        message: `Monthly free AI quota limit reached (${usage.maxTokens.toLocaleString()} tokens / ${usage.maxRequests} requests). Quota resets on ${usage.resetDate}.`,
      },
    };
  }
  return { allowed: true };
}

export async function logAiUsageAction(params: {
  userId: string;
  projectId?: string | null;
  operation: "chat" | "analyze" | "architecture" | "roadmap" | "document";
  provider: "groq" | "gemini" | "tavily";
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs?: number;
  status: "success" | "error" | "quota_exceeded";
}) {
  try {
    const prompt = params.promptTokens || 0;
    const completion = params.completionTokens || 0;
    const total = params.totalTokens || prompt + completion || 150; // default estimated usage if provider doesn't output tokens

    await prisma.aiUsageLog.create({
      data: {
        userId: params.userId,
        projectId: params.projectId || null,
        operation: params.operation,
        provider: params.provider,
        model: params.model || "default",
        promptTokens: prompt,
        completionTokens: completion,
        totalTokens: total,
        durationMs: params.durationMs || 0,
        status: params.status,
      },
    });
  } catch (err) {
    console.error("Failed to persist AI usage log:", err);
  }
}
