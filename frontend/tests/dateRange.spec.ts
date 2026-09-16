import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateRange } from '@/utils/DateRangeUtil.js';

describe('DateRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the first and last day of a 31-day month', () => {
    expect(DateRange.ofMonth(2026, 1)).toEqual({ start: '2026-01-01', end: '2026-01-31' });
  });

  it('handles February in leap and non-leap years', () => {
    expect(DateRange.ofMonth('2024', '02')).toEqual({ start: '2024-02-01', end: '2024-02-29' });
    expect(DateRange.ofMonth('2026', '02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });

  it('builds the full current month regardless of the current day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 10, 12));

    expect(DateRange.currentMonthFull()).toEqual({ start: '2026-04-01', end: '2026-04-30' });
  });

  it('builds the current month up to today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 10, 12));

    expect(DateRange.currentMonthToDate()).toEqual({ start: '2026-04-01', end: '2026-04-10' });
  });
});
