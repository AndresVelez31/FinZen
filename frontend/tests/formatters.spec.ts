import { describe, it, expect } from 'vitest';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

describe('FormattersUtil.formatToCOP', () => {
  it('formats a positive amount as COP currency', () => {
    expect(FormattersUtil.formatToCOP(15000)).toContain('15.000');
  });

  it('formats zero', () => {
    expect(FormattersUtil.formatToCOP(0)).toContain('0');
  });

  it('formats negative amounts with a minus sign', () => {
    expect(FormattersUtil.formatToCOP(-5000)).toContain('-');
  });
});

describe('FormattersUtil.monthKey', () => {
  it('extracts the YYYY-MM key from an ISO date', () => {
    expect(FormattersUtil.monthKey('2026-01-05')).toBe('2026-01');
  });

  it('extracts the key even with a full ISO timestamp', () => {
    expect(FormattersUtil.monthKey('2026-11-30T10:00:00.000Z')).toBe('2026-11');
  });
});

describe('FormattersUtil.initials', () => {
  it('returns initials for a two-word name', () => {
    expect(FormattersUtil.initials('Ana Garcia')).toBe('AG');
  });

  it('returns a single initial for a one-word name', () => {
    expect(FormattersUtil.initials('Ana')).toBe('A');
  });

  it('returns an empty string for an empty name', () => {
    expect(FormattersUtil.initials('')).toBe('');
  });
});

describe('FormattersUtil.formatDate', () => {
  it('formats an ISO date in Spanish using UTC', () => {
    expect(FormattersUtil.formatDate('2026-01-05')).toBe('5 de enero de 2026');
  });
});
