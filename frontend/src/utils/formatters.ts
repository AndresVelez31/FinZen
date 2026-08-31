/**
 * Formats a number as Colombian Peso currency (e.g. 15000 -> "$ 15.000").
 */
export function formatToCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an ISO date string as a human-readable Spanish date (e.g. "5 de enero de 2026").
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr));
}

/**
 * Extracts the "YYYY-MM" month key from an ISO date string, used to group by month.
 */
export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}
