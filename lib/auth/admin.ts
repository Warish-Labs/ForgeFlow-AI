/**
 * lib/auth/admin.ts
 *
 * Legacy compatibility shim — re-exports from lib/auth/guard.ts.
 * Kept so existing imports throughout the codebase continue to work
 * without a full rename refactor.
 */

export {
  isSuperAdminEmail,
  checkIsAdmin as checkIsSuperAdminAction,
  requireAdmin as requireSuperAdminAction,
} from "@/lib/auth/guard";
