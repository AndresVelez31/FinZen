// External imports
import { createError } from 'h3';

// Exports
export class AccountsValidator {
  /**
   * Parses the `:id` route param and rejects anything that is not a positive integer.
   */
  public static parseId(rawId: string | undefined): number {
    if (!rawId || !/^\d+$/.test(rawId) || Number(rawId) < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El id de la cuenta debe ser un entero positivo',
      });
    }
    return Number(rawId);
  }
}
