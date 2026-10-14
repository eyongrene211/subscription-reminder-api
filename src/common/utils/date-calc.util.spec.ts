import {
  calculateNextBillingDate,
  isDueWithinDays,
  normalizeToStartOfDay,
} from './date-calc.util';
import { BillingCycle } from '../enums';

describe('date-calc.util', () => {
  describe('calculateNextBillingDate', () => {
    it('should return base date if it is in the future', () => {
      const base = new Date('2026-11-01');
      const ref = new Date('2026-10-14');
      const next = calculateNextBillingDate(base, BillingCycle.MONTHLY, ref);
      expect(next.toISOString().split('T')[0]).toBe('2026-11-01');
    });

    it('should roll forward monthly for a past date', () => {
      const base = new Date('2026-08-15');
      const ref = new Date('2026-10-14');
      const next = calculateNextBillingDate(base, BillingCycle.MONTHLY, ref);
      expect(next.toISOString().split('T')[0]).toBe('2026-10-15');
    });

    it('should roll forward yearly for a past date', () => {
      const base = new Date('2024-10-20');
      const ref = new Date('2026-10-14');
      const next = calculateNextBillingDate(base, BillingCycle.YEARLY, ref);
      expect(next.toISOString().split('T')[0]).toBe('2026-10-20');
    });
  });

  describe('isDueWithinDays', () => {
    const today = new Date('2026-10-14');

    it('should return true if target is today (0 days ahead)', () => {
      expect(isDueWithinDays(new Date('2026-10-14'), 3, today)).toBe(true);
    });

    it('should return true if target is 2 days ahead', () => {
      expect(isDueWithinDays(new Date('2026-10-16'), 3, today)).toBe(true);
    });

    it('should return true if target is 3 days ahead (boundary)', () => {
      expect(isDueWithinDays(new Date('2026-10-17'), 3, today)).toBe(true);
    });

    it('should return false if target is 4 days ahead', () => {
      expect(isDueWithinDays(new Date('2026-10-18'), 3, today)).toBe(false);
    });

    it('should return false if target is in the past', () => {
      expect(isDueWithinDays(new Date('2026-10-13'), 3, today)).toBe(false);
    });
  });
});
