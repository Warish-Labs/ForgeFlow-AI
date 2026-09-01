import { describe, it, expect } from "vitest";
import {
  getStartOfTodayUTC,
  getEndOfTodayUTC,
  getStartOfMonthUTC,
  getStartOfNextMonthUTC,
  getFormattedMonthResetLabel,
} from "@/lib/services/usagePeriod";

describe("Canonical Usage Period Calculator Suite", () => {
  it("1. Should return exact 00:00:00.000 UTC for start of today", () => {
    const testDate = new Date("2026-09-01T15:30:45.123Z");
    const startOfToday = getStartOfTodayUTC(testDate);

    expect(startOfToday.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("2. Should return exact 23:59:59.999 UTC for end of today", () => {
    const testDate = new Date("2026-09-01T08:12:00.000Z");
    const endOfToday = getEndOfTodayUTC(testDate);

    expect(endOfToday.toISOString()).toBe("2026-09-01T23:59:59.999Z");
  });

  it("3. Should return exact 1st day 00:00:00.000 UTC for start of month", () => {
    const testDate = new Date("2026-09-15T22:45:00.000Z");
    const startOfMonth = getStartOfMonthUTC(testDate);

    expect(startOfMonth.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("4. Should handle day boundary transition within same month without resetting month start", () => {
    const day1 = new Date("2026-09-01T23:59:00.000Z");
    const day2 = new Date("2026-09-02T00:01:00.000Z");

    const monthStart1 = getStartOfMonthUTC(day1);
    const monthStart2 = getStartOfMonthUTC(day2);

    expect(monthStart1.toISOString()).toBe(monthStart2.toISOString());
    expect(monthStart1.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("5. Should transition start of month across month boundary (Aug 31 -> Sep 1)", () => {
    const endOfAug = new Date("2026-08-31T23:59:59.999Z");
    const startOfSep = new Date("2026-09-01T00:00:00.000Z");

    const augMonth = getStartOfMonthUTC(endOfAug);
    const sepMonth = getStartOfMonthUTC(startOfSep);

    expect(augMonth.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(sepMonth.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("6. Should handle February leap year boundaries properly", () => {
    const febLeap = new Date("2028-02-29T12:00:00.000Z");
    const marFirst = new Date("2028-03-01T00:00:00.000Z");

    expect(getStartOfMonthUTC(febLeap).toISOString()).toBe("2028-02-01T00:00:00.000Z");
    expect(getStartOfMonthUTC(marFirst).toISOString()).toBe("2028-03-01T00:00:00.000Z");
  });

  it("7. Should calculate next month reset label correctly", () => {
    const testDate = new Date("2026-09-10T10:00:00.000Z");
    const resetLabel = getFormattedMonthResetLabel(testDate);

    expect(resetLabel).toBe("1st of Oct");
  });
});
