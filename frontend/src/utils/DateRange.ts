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
}
