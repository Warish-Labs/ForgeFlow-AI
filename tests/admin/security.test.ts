import { describe, it, expect } from "vitest";
import { isSuperAdminEmail } from "@/lib/auth/guard";

describe("Admin Authorization Guard Security Tests", () => {
  it("should recognize whitelisted admin emails as super admins", () => {
    expect(isSuperAdminEmail("warishlabs@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("warishprojects@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("WARISHLABS@GMAIL.COM")).toBe(true); // case-insensitive
  });

  it("should recognize admin emails configured via ADMIN_EMAIL_1 and ADMIN_EMAIL_2 env vars", () => {
    process.env.ADMIN_EMAIL_1 = "customadmin1@warishlabs.in";
    process.env.ADMIN_EMAIL_2 = "customadmin2@warishlabs.in";
    expect(isSuperAdminEmail("customadmin1@warishlabs.in")).toBe(true);
    expect(isSuperAdminEmail("customadmin2@warishlabs.in")).toBe(true);
  });

  it("should reject non-admin emails", () => {
    expect(isSuperAdminEmail("attacker@evil.com")).toBe(false);
    expect(isSuperAdminEmail("user@example.com")).toBe(false);
    expect(isSuperAdminEmail("")).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
    expect(isSuperAdminEmail(undefined)).toBe(false);
  });

  it("should handle whitespace trimming cleanly", () => {
    expect(isSuperAdminEmail("  warishlabs@gmail.com  ")).toBe(true);
    expect(isSuperAdminEmail("  user@example.com  ")).toBe(false);
  });
});
