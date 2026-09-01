/**
 * Canonical Usage Period Calculator for ForgeFlow AI.
 * Enforces strict UTC reset semantics across Admin dashboard, User dashboard, and Quota engines.
 *
 * Reset rules:
 * - Daily period: 00:00:00.000 UTC of current day -> 23:59:59.999 UTC of current day
 * - Monthly period: 00:00:00.000 UTC of the 1st day of current month -> NOW
 * - Next Month reset: 00:00:00.000 UTC of the 1st day of next month
 */

export function getStartOfTodayUTC(referenceDate: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

export function getEndOfTodayUTC(referenceDate: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

export function getStartOfMonthUTC(referenceDate: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      1,
      0,
      0,
      0,
      0
    )
  );
}

export function getStartOfNextMonthUTC(referenceDate: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() + 1,
      1,
      0,
      0,
      0,
      0
    )
  );
}

export function getFormattedMonthResetLabel(referenceDate: Date = new Date()): string {
  const nextMonth = getStartOfNextMonthUTC(referenceDate);
  const monthName = nextMonth.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `1st of ${monthName}`;
}
