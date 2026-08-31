/**
 * lib/auth/guard.ts
 *
 * Centralized authorization utilities for ForgeFlow AI.
 *
 * Security design:
 * - Single source of truth: Prisma `User.role` column ("SUPER_ADMIN" | "USER").
 * - Admin check is ALWAYS done server-side, never trusting client state.
 * - All /admin/* routes and server actions call requireAdminPage() or checkIsAdmin().
 * - Non-admin users are redirected to /dashboard or receive a thrown error from server actions.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export type Role = "SUPER_ADMIN" | "USER";

// ─── Admin email whitelist ────────────────────────────────────────────────────

const DEFAULT_ADMIN_EMAILS = [
  "warishlabs@gmail.com",
  "warishprojects@gmail.com",
  "admin@warishlabs.in",
  "warish@warishlabs.in",
];

/**
 * Returns true if the provided email is in the admin whitelist.
 * Checks env vars ADMIN_EMAIL_1, ADMIN_EMAIL_2, and default admin emails.
 * Case-insensitive, trims whitespace.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();

  const allowed = new Set<string>();

  // 1. First check env vars ADMIN_EMAIL_1 & ADMIN_EMAIL_2
  const env1 = process.env.ADMIN_EMAIL_1?.trim().toLowerCase();
  const env2 = process.env.ADMIN_EMAIL_2?.trim().toLowerCase();
  if (env1) allowed.add(env1);
  if (env2) allowed.add(env2);

  // 2. Add default admin fallback emails
  DEFAULT_ADMIN_EMAILS.forEach((e) => allowed.add(e.toLowerCase()));

  // 3. Add comma-separated ADMIN_USER_IDS / emails
  const envIds = process.env.ADMIN_USER_IDS?.split(",") ?? [];
  for (const id of envIds) {
    const trimmed = id.trim().toLowerCase();
    if (trimmed) allowed.add(trimmed);
  }

  return allowed.has(target);
}

/**
 * Single source of truth for user role resolution.
 * Checks Prisma User.role first.
 * If user does not exist in DB yet, checks admin whitelist email list.
 * If whitelisted, provisions user in Prisma DB as SUPER_ADMIN; otherwise USER.
 * Returns canonical Role ("SUPER_ADMIN" | "USER").
 */
export async function getUserRole(userId?: string | null, email?: string | null): Promise<Role> {
  if (!userId && !email) return "USER";

  try {
    const cleanEmail = email?.trim().toLowerCase();
    const isWhitelisted = isSuperAdminEmail(email);

    // 1. Whitelisted emails are ALWAYS SUPER_ADMIN
    if (isWhitelisted) {
      if (userId && cleanEmail) {
        await prisma.user.upsert({
          where: { id: userId },
          create: { id: userId, email: cleanEmail, role: "SUPER_ADMIN" },
          update: { email: cleanEmail, role: "SUPER_ADMIN" },
        }).catch((e) => console.error("[getUserRole] DB role sync failed:", e));
      }
      return "SUPER_ADMIN";
    }

    // 2. Query DB by userId or email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    if (existing) {
      return existing.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "USER";
    }

    // 3. Non-whitelisted new user -> default USER
    if (userId && cleanEmail) {
      await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, email: cleanEmail, role: "USER" },
        update: { email: cleanEmail },
      }).catch((e) => console.error("[getUserRole] DB user creation failed:", e));
    }

    return "USER";
  } catch (err) {
    console.error("[getUserRole] DB lookup error:", err);
    return isSuperAdminEmail(email) ? "SUPER_ADMIN" : "USER";
  }
}

// ─── Session Auth Check ───────────────────────────────────────────────────────

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
  role: Role;
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
    if (!user) return { isAdmin: false, role: "USER" };

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    const allEmails = user.emailAddresses.map((e) => e.emailAddress);
    const primaryOrWhitelisted = allEmails.find((e) => isSuperAdminEmail(e)) || primaryEmail;

    const role = await getUserRole(user.id, primaryOrWhitelisted);
    const isAdmin = role === "SUPER_ADMIN";

    return { isAdmin, role, userId: user.id, email: primaryEmail };
  } catch {
    return { isAdmin: false, role: "USER" };
  }
}

/**
 * Enforces super-admin authorization for server actions.
 * THROWS with UNAUTHORIZED_ADMIN error code if not an admin.
 * Use this at the top of every admin server action.
 */
export async function requireAdmin(): Promise<{ userId: string; email: string; role: Role }> {
  const { isAdmin, role, userId, email } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }
  return { userId, email: email ?? "", role };
}

/**
 * Enforces super-admin authorization for page-level server components.
 * REDIRECTS to /dashboard with a 403 flash if not an admin.
 * Call at the top of any admin page that needs protection beyond the layout gate.
 */
export async function requireAdminPage(): Promise<{ userId: string; email: string; role: Role }> {
  const { isAdmin, role, userId, email } = await checkIsAdmin();
  if (!isAdmin || !userId) {
    redirect("/dashboard");
  }
  return { userId, email: email ?? "", role };
}

// ─── User Ownership Check ─────────────────────────────────────────────────────

export async function canAccessResource(resourceOwnerId: string): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return false;
  if (userId === resourceOwnerId) return true;

  const { isAdmin } = await checkIsAdmin();
  return isAdmin;
}
