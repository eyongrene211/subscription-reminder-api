import { BillingCycle } from '../enums';

/**
 * Normalizes a date to midnight UTC (00:00:00.000) for consistent day-based comparisons.
 *
 * @param date - Date object or ISO date string
 * @returns Date normalized to the start of the UTC calendar day
 */
export function normalizeToStartOfDay(date: string | Date): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Calculates the next billing date for a subscription based on its cycle.
 * If the base billing date is already today or in the future, it is returned.
 * If it is in the past, it rolls forward monthly or yearly until it is >= current date.
 *
 * @param baseDate - The anchor billing start date
 * @param cycle - The recurring billing cycle (MONTHLY or YEARLY)
 * @param referenceDate - The reference "today" date (defaults to current system time)
 * @returns The calculated next billing date
 */
export function calculateNextBillingDate(
  baseDate: string | Date,
  cycle: BillingCycle,
  referenceDate: string | Date = new Date(),
): Date {
  const ref = normalizeToStartOfDay(referenceDate);
  const target = normalizeToStartOfDay(baseDate);

  if (target >= ref) {
    return target;
  }

  const anchorDay = target.getUTCDate();

  while (target < ref) {
    if (cycle === BillingCycle.MONTHLY) {
      const nextMonth = target.getUTCMonth() + 1;
      target.setUTCMonth(nextMonth);
      // Handle day of month clipping (e.g. Jan 31 -> Feb 28)
      if (target.getUTCDate() !== anchorDay) {
        target.setUTCDate(0); // last day of previous month
      }
    } else if (cycle === BillingCycle.YEARLY) {
      target.setUTCFullYear(target.getUTCFullYear() + 1);
    } else {
      break;
    }
  }

  return target;
}

/**
 * Checks if a target date falls within the next N days from reference date (inclusive).
 *
 * @param targetDate - The date to check (e.g., next billing date)
 * @param days - Number of days ahead to include (default: 3)
 * @param referenceDate - The starting date (default: today)
 * @returns True if target date is between today and today + N days (inclusive)
 */
export function isDueWithinDays(
  targetDate: string | Date,
  days = 3,
  referenceDate: string | Date = new Date(),
): boolean {
  const target = normalizeToStartOfDay(targetDate);
  const ref = normalizeToStartOfDay(referenceDate);

  const diffMs = target.getTime() - ref.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= days;
}
