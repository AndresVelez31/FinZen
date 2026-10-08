// Exports
// Splits an already loaded list into pages; the API returns whole lists, so paging happens here.
export class PaginationUtil {
  /**
   * Number of pages needed to show `total` items, `pageSize` at a time (at least 1).
   */
  public static countPages(total: number, pageSize: number): number {
    return Math.max(1, Math.ceil(total / pageSize));
  }

  /**
   * The items of a 1-based page (e.g. page 2 of size 10 -> items 11 to 20).
   */
  public static extractPage<T>(items: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  /**
   * Page numbers to show around the current one, with null where pages are skipped
   * (e.g. 1 … 4 5 6 … 12). With 7 pages or fewer every page is shown.
   */
  public static buildPageList(current: number, pageCount: number): (number | null)[] {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const start = Math.max(2, Math.min(current - 1, pageCount - 4));
    const end = Math.min(pageCount - 1, Math.max(current + 1, 5));
    const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index);

    return [
      1,
      ...(start > 2 ? [null] : []),
      ...middle,
      ...(end < pageCount - 1 ? [null] : []),
      pageCount,
    ];
  }
}
