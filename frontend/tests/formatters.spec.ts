import { describe, it, expect } from 'vitest';
import { Formatters } from '@/utils/formatters';

describe('Formatters.formatToCOP', () => {
  it('formats a positive amount as COP currency', () => {
    expect(Formatters.formatToCOP(15000)).toContain('15.000');
  });

  it('formats zero', () => {
    expect(Formatters.formatToCOP(0)).toContain('0');
  });

  it('formats negative amounts with a minus sign', () => {
    expect(Formatters.formatToCOP(-5000)).toContain('-');
  });
});

describe('Formatters.monthKey', () => {
  it('extracts the YYYY-MM key from an ISO date', () => {
    expect(Formatters.monthKey('2026-01-05')).toBe('2026-01');
  });

  it('extracts the key even with a full ISO timestamp', () => {
    expect(Formatters.monthKey('2026-11-30T10:00:00.000Z')).toBe('2026-11');
  });
});

describe('Formatters.initials', () => {
  it('returns initials for a two-word name', () => {
    expect(Formatters.initials('Ana Garcia')).toBe('AG');
  });

  it('returns a single initial for a one-word name', () => {
    expect(Formatters.initials('Ana')).toBe('A');
  });

  it('returns an empty string for an empty name', () => {
    expect(Formatters.initials('')).toBe('');
  });
});