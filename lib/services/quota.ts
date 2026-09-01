import { prisma } from "@/lib/db/prisma";
import { PLAN_LIMITS, ERROR_CODES } from "@/lib/config/plans";
import { checkIsSuperAdminAction } from "@/lib/auth/admin";
import { logAuditEventAction } from "@/lib/services/audit";
import {
  getStartOfTodayUTC,
  getEndOfTodayUTC,
  getStartOfMonthUTC,
  getFormattedMonthResetLabel,
} from "./usagePeriod";

export interface QuotaUsageResult {
  isAdmin?: boolean;
  projectsCount: number;
  maxProjects: number;
  totalTokens: number; // Today's tokens for daily quota
  tokensToday: number;
  tokensThisMonth: number;
  maxTokens: number; // Daily max token limit
  totalRequests: number; // Today's requests for daily quota
  requestsToday: number;
  requestsThisMonth: number;
  maxRequests: number; // Daily max request limit
  remainingTokens: number;
  remainingRequests: number;
  resetDate: string; // Daily reset: "Daily at 00:00 UTC"
  isExhausted: boolean;
  status: "healthy" | "warning" | "critical" | "exhausted";
  // Tavily Monthly Research Credit Counter
  tavilySearchCount: number;
  maxTavilySearches: number;
  remainingTavilySearches: number;
  tavilyResetDate: string; // Monthly reset on 1st of month
  isTavilyExhausted: boolean;
}

export async function getUserQuotaUsageAction(userId: string): Promise<QuotaUsageResult> {
  const maxProjects = PLAN_LIMITS.FREE.maxProjects;
  const maxTokens = PLAN_LIMITS.FREE.aiTokenLimit;
  const maxRequests = PLAN_LIMITS.FREE.aiRequestLimit;
  const maxTavilySearches = PLAN_LIMITS.FREE.tavilyMonthlyLimit;

  // Projects count
  const projectsCount = await prisma.project.count({
    where: { ownerId: userId },
  });

  // Calculate UTC period boundaries
  const now = new Date();
  const startOfToday = getStartOfTodayUTC(now);
  const endOfToday = getEndOfTodayUTC(now);
  const startOfMonth = getStartOfMonthUTC(now);

  // Aggregate LLM Usage Today (Groq & Gemini)
  const todayAggregate = await prisma.aiUsageLog.aggregate({
    where: {
      userId,
      provider: { in: ["groq", "gemini"] },
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    _sum: {
      totalTokens: true,
    },
    _count: {
      id: true,
    },
  });

  // Aggregate LLM Usage This Month (Groq & Gemini)
  const monthAggregate = await prisma.aiUsageLog.aggregate({
    where: {
      userId,
      provider: { in: ["groq", "gemini"] },
      createdAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      totalTokens: true,
    },
    _count: {
      id: true,
    },
  });

  const tokensToday = todayAggregate._sum.totalTokens || 0;
  const requestsToday = todayAggregate._count.id || 0;
  const tokensThisMonth = monthAggregate._sum.totalTokens || 0;
  const requestsThisMonth = monthAggregate._count.id || 0;

  const remainingTokens = Math.max(0, maxTokens - tokensToday);
  const remainingRequests = Math.max(0, maxRequests - requestsToday);

  const tokenUsagePercent = (tokensToday / maxTokens) * 100;
  const isExhausted = tokensToday >= maxTokens || requestsToday >= maxRequests;

  let status: "healthy" | "warning" | "critical" | "exhausted" = "healthy";
  if (isExhausted) {
    status = "exhausted";
  } else if (tokenUsagePercent >= 90) {
    status = "critical";
  } else if (tokenUsagePercent >= 75) {
    status = "warning";
  }

  const resetDate = "Daily at 00:00 UTC";

  // Calculate monthly Tavily credits (Resets on 1st of month)
  const tavilyCount = await prisma.aiUsageLog.count({
    where: {
      userId,
      provider: "tavily",
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  const remainingTavilySearches = Math.max(0, maxTavilySearches - tavilyCount);
  const isTavilyExhausted = tavilyCount >= maxTavilySearches;
  const tavilyResetDate = getFormattedMonthResetLabel(now);

  const { isAdmin } = await checkIsSuperAdminAction();

  return {
    isAdmin,
    projectsCount,
    maxProjects: isAdmin ? 999 : maxProjects,
    totalTokens: tokensToday,
    tokensToday,
    tokensThisMonth,
    maxTokens: isAdmin ? 10000000 : maxTokens,
    totalRequests: requestsToday,
    requestsToday,
    requestsThisMonth,
    maxRequests: isAdmin ? 999999 : maxRequests,
    remainingTokens: isAdmin ? 10000000 : remainingTokens,
    remainingRequests: isAdmin ? 999999 : remainingRequests,
    resetDate,
    isExhausted: isAdmin ? false : isExhausted,
    status: isAdmin ? "healthy" : status,
    // Tavily details
    tavilySearchCount: tavilyCount,
    maxTavilySearches: isAdmin ? 999999 : maxTavilySearches,
    remainingTavilySearches: isAdmin ? 999999 : remainingTavilySearches,
    tavilyResetDate,
    isTavilyExhausted: isAdmin ? false : isTavilyExhausted,
  };
}

export async function checkUserCanCreateProjectAction(userId: string) {
  try {
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
      }).catch(() => {});
      return {
        allowed: false,
        error: {
          code: ERROR_CODES.FREE_PROJECT_LIMIT_REACHED,
          message: `Free tier is limited to ${usage.maxProjects} project. Please upgrade to Premium for unlimited projects.`,
        },
      };
    }
    return { allowed: true };
  } catch (err) {
    console.error("[checkUserCanCreateProjectAction] Error checking quota:", err);
    return { allowed: true };
  }
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
        message: `Daily free AI quota limit reached (${usage.maxTokens.toLocaleString()} tokens / ${usage.maxRequests} requests per day). Quota resets daily at 00:00 UTC.`,
      },
    };
  }
  return { allowed: true };
}

export async function checkUserTavilyQuotaAction(userId: string) {
  const { isAdmin } = await checkIsSuperAdminAction();
  if (isAdmin) {
    return { allowed: true, isAdmin: true };
  }

  const usage = await getUserQuotaUsageAction(userId);
  if (usage.isTavilyExhausted) {
    await logAuditEventAction({
      userId,
      action: "AI_QUOTA_TRIGGERED",
      metadata: { reason: "TAVILY_QUOTA_EXCEEDED", searchCount: usage.tavilySearchCount, maxTavilySearches: usage.maxTavilySearches },
    });
    return {
      allowed: false,
      error: {
        code: ERROR_CODES.FREE_TAVILY_QUOTA_EXCEEDED,
        message: `Monthly web research credit limit reached (${usage.maxTavilySearches} searches / month). Resets on ${usage.tavilyResetDate}.`,
      },
    };
  }
  return { allowed: true };
}

export async function logAiUsageAction(params: {
  userId: string;
  projectId?: string | null;
  operation: "chat" | "analyze" | "architecture" | "roadmap" | "document" | "design" | "web_search";
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
    const total = params.totalTokens || prompt + completion || (params.provider === "tavily" ? 1 : 150);

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
