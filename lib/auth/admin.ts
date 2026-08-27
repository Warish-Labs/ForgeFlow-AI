import { currentUser } from "@clerk/nextjs/server";
import { ERROR_CODES } from "@/lib/config/plans";

const DEFAULT_ADMIN_EMAILS = [
  "warishlabs@gmail.com",
  "warishdeveloper@gmail.com",
  "warishprojects@gmail.com",
  "admin@warishlabs.in",
  "warish@warishlabs.in",
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();

  const envAdmin1 = process.env.ADMIN_EMAIL_1?.trim().toLowerCase();
  const envAdmin2 = process.env.ADMIN_EMAIL_2?.trim().toLowerCase();

  const allowedAdmins = new Set<string>();

  if (envAdmin1) allowedAdmins.add(envAdmin1);
  if (envAdmin2) allowedAdmins.add(envAdmin2);

  // Always include default fallback admin emails
  DEFAULT_ADMIN_EMAILS.forEach((e) => allowedAdmins.add(e.toLowerCase()));

  return allowedAdmins.has(target);
}

export async function checkIsSuperAdminAction(): Promise<{
  isAdmin: boolean;
  email?: string;
  userId?: string;
}> {
  const user = await currentUser();
  if (!user) return { isAdmin: false };

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress;

  const allUserEmails = user.emailAddresses.map((e) => e.emailAddress);

  const isAdmin = allUserEmails.some((email) => isSuperAdminEmail(email));

  return {
    isAdmin,
    email: primaryEmail,
    userId: user.id,
  };
}

export async function requireSuperAdminAction() {
  const { isAdmin, email, userId } = await checkIsSuperAdminAction();
  if (!isAdmin) {
    throw new Error(ERROR_CODES.UNAUTHORIZED_ADMIN);
  }
  return { email, userId };
}
