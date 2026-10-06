// External imports
import { afterEach, describe, expect, it, vi } from 'vitest';

// Internal imports
import { DateRangeUtil } from '@/utils/DateRangeUtil.js';

describe('DateRangeUtil', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the first and last day of a 31-day month', () => {
    expect(DateRangeUtil.buildMonthRange(2026, 1)).toEqual({
      start: '2026-01-01',
      end: '2026-01-31',
    });
  });

  it('handles February in leap and non-leap years', () => {
    expect(DateRangeUtil.buildMonthRange('2024', '02')).toEqual({
      start: '2024-02-01',
      end: '2024-02-29',
    });
    expect(DateRangeUtil.buildMonthRange('2026', '02')).toEqual({
      start: '2026-02-01',
      end: '2026-02-28',
    });
  });

  it('builds the full current month regardless of the current day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 10, 12));

    expect(DateRangeUtil.buildCurrentMonthRange()).toEqual({
      start: '2026-04-01',
      end: '2026-04-30',
    });
  });

  it('builds the current month up to today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 10, 12));

    expect(DateRangeUtil.buildMonthToDateRange()).toEqual({
      start: '2026-04-01',
      end: '2026-04-10',
    });
  });
});
