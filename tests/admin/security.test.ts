import { describe, it, expect } from "vitest";
import { isSuperAdminEmail } from "@/lib/auth/guard";

describe("Admin Authorization Guard Security Tests", () => {
  it("should recognize whitelisted admin emails as super admins", () => {
    expect(isSuperAdminEmail("warishlabs@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("warishdeveloper@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("warishprojects@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("WARISHLABS@GMAIL.COM")).toBe(true); // case-insensitive
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
