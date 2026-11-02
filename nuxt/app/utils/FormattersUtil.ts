// Exports
export class FormattersUtil {
  /**
   * Formats a number as Colombian Peso currency (e.g. 15000 -> "$ 15.000").
   */
  public static formatToCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Formats an ISO date string as a human-readable Spanish date (e.g. "5 de enero de 2026").
   */
  public static formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(isoDate));
  }
}
