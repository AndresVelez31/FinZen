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
  public static formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(dateStr));
  }

  /**
   * Formats an ISO date string as a short Spanish date for tight spaces (e.g. "5 ene 2026").
   */
  public static formatShortDate(dateStr: string): string {
    const parts = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).formatToParts(new Date(dateStr));
    return parts
      .filter((part) => part.type !== 'literal')
      .map((part) => part.value.replace('.', ''))
      .join(' ');
  }

  /**
   * Extracts the "YYYY-MM" month key from an ISO date string, used to group by month.
   */
  public static extractMonthKey(dateStr: string): string {
    return dateStr.slice(0, 7);
  }

  /**
   * Extracts up to two initials from a full name (e.g. "Ana García" -> "AG").
   */
  public static extractInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
}
