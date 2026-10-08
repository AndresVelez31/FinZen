// External imports
import { describe, expect, it } from 'vitest';

// Internal imports
import { PaginationUtil } from '@/utils/PaginationUtil.js';

describe('PaginationUtil.countPages', () => {
  it('rounds up to fit every item', () => {
    expect(PaginationUtil.countPages(62, 10)).toBe(7);
  });

  it('is at least one page when the list is empty', () => {
    expect(PaginationUtil.countPages(0, 10)).toBe(1);
  });
});

describe('PaginationUtil.extractPage', () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it('returns the items of a 1-based page', () => {
    expect(PaginationUtil.extractPage(items, 2, 10)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });

  it('returns the remaining items on the last page', () => {
    expect(PaginationUtil.extractPage(items, 3, 10)).toEqual([21, 22, 23, 24, 25]);
  });
});

describe('PaginationUtil.buildPageList', () => {
  it('lists every page when there are seven or fewer', () => {
    expect(PaginationUtil.buildPageList(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('skips the far end at the start', () => {
    expect(PaginationUtil.buildPageList(1, 12)).toEqual([1, 2, 3, 4, 5, null, 12]);
  });

  it('skips both sides in the middle', () => {
    expect(PaginationUtil.buildPageList(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
  });

  it('skips the start at the end', () => {
    expect(PaginationUtil.buildPageList(12, 12)).toEqual([1, null, 8, 9, 10, 11, 12]);
  });
});
