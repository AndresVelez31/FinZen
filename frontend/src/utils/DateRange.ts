export class DateRange {
  /**
   * Returns the first and last day of the given month as ISO date strings
   * (YYYY-MM-DD).
   */
  static ofMonth(year: string | number, month: string | number): { start: string; end: string } {
    const paddedMonth = String(month).padStart(2, '0');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();

    return {
      start: `${year}-${paddedMonth}-01`,
      end: `${year}-${paddedMonth}-${String(lastDay).padStart(2, '0')}`,
    };
  }

  /**
   * The current calendar month in full: day 1 through its last day,
   * regardless of today's date. Includes dates later in the month that
   * haven't happened yet.
   */
  static currentMonthFull(): { start: string; end: string } {
    const now = new Date();
    return this.ofMonth(now.getFullYear(), now.getMonth() + 1);
  }

  /**
   * The current calendar month up to today: day 1 through today's date,
   * not the end of the month.
   */
  static currentMonthToDate(): { start: string; end: string } {
    const now = new Date();
    const paddedMonth = String(now.getMonth() + 1).padStart(2, '0');

    return {
      start: `${now.getFullYear()}-${paddedMonth}-01`,
      end: now.toISOString().slice(0, 10),
    };
  }
}
