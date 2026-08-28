/**
 * lib/auth/guard.ts
 *
 * Centralized authorization utilities for ForgeFlow AI.
 *
 * Security design:
 * - Admin check is ALWAYS done server-side, never trusting client state.
 * - All /admin/* routes and server actions call requireSuperAdmin() or checkIsAdmin().
 * - Non-admin users are shown a 403 page or receive a thrown error from server actions.
 * - Never expose admin data to non-admin callers — no reliance on UI hiding alone.
 *
 * SECURITY NOTE: ADMIN_USER_IDS, CLERK_SECRET_KEY must never have NEXT_PUBLIC_ prefix.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// ─── Admin email whitelist ────────────────────────────────────────────────────

const DEFAULT_ADMIN_EMAILS = [
  "warishlabs@gmail.com",
  "warishdeveloper@gmail.com",
  "warishprojects@gmail.com",
  "admin@warishlabs.in",
  "warish@warishlabs.in",
];

/**
 * Returns true if the provided email is in the admin whitelist.
 * Checks env vars ADMIN_EMAIL_1, ADMIN_EMAIL_2, and hardcoded defaults.
 * Case-insensitive, trims whitespace.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();

  const allowed = new Set<string>(DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()));

  const env1 = process.env.ADMIN_EMAIL_1?.trim().toLowerCase();
  const env2 = process.env.ADMIN_EMAIL_2?.trim().toLowerCase();
  if (env1) allowed.add(env1);
  if (env2) allowed.add(env2);

  // Also support comma-separated ADMIN_USER_IDS for email or user IDs
  const envIds = process.env.ADMIN_USER_IDS?.split(",") ?? [];
  for (const id of envIds) {
    const trimmed = id.trim().toLowerCase();
    if (trimmed) allowed.add(trimmed);
  }

  return allowed.has(target);
}

// ─── Session Auth Check ───────────────────────────────────────────────────────

/**
 * Returns the current authenticated user's ID or null.
 * Safe to call from server components and server actions.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

// ─── Admin Checks ─────────────────────────────────────────────────────────────

export interface AdminCheckResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
}

/**
 * Checks if the currently authenticated user is a super-admin.
 * Does NOT throw — returns isAdmin: false for non-admin and unauthenticated users.
 * Use this for conditional rendering guards.
 */
export async function checkIsAdmin(): Promise<AdminCheckResult> {
  try {
    const user = await currentUser();
    if (!user) return { isAdmin: false };

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    const allEmails = user.emailAddresses.map((e) => e.emailAddress);
    const isAdmin = allEmails.some((email) => isSuperAdminEmail(email));

    return { isAdmin, userId: user.id, email: primaryEmail };
  } catch {
    return { isAdmin: false };
  }
}

/**
 * Enforces super-admin authorization for server actions.
 * THROWS with UNAUTHORIZED_ADMIN error code if not an admin.
 * Use this at the top of every admin server action.
 */
export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const { isAdmin, userId, email } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }
  return { userId, email: email ?? "" };
}

/**
 * Enforces super-admin authorization for page-level server components.
 * REDIRECTS to /dashboard with a 403 flash if not an admin.
 * Call at the top of any admin page that needs protection beyond the layout gate.
 */
export async function requireAdminPage(): Promise<{ userId: string; email: string }> {
  const { isAdmin, userId, email } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    redirect("/dashboard");
  }
  return { userId, email: email ?? "" };
}

// ─── User Ownership Check ─────────────────────────────────────────────────────

/**
 * Asserts that the authenticated user owns the given resource (by ownerId).
 * Admin users bypass ownership — they can access any resource.
 * Returns true if allowed, false if denied.
 */
export async function canAccessResource(resourceOwnerId: string): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return false;
  if (userId === resourceOwnerId) return true;

  // Admins bypass ownership
  const { isAdmin } = await checkIsAdmin();
  return isAdmin;
}
