// External imports
import { createError } from 'h3';

// Internal imports
import type { Account } from './account.entity';
import { ACCOUNTS } from './accounts.data';

// Exports
// The methods are async to match the backend style: a real database call would be async too.
export class AccountsService {
  public static async findAll(): Promise<Account[]> {
    return await Promise.resolve(ACCOUNTS);
  }

  public static async findOne(id: number): Promise<Account> {
    const account = ACCOUNTS.find((candidate) => candidate.id === id);
    if (!account) {
      throw createError({ statusCode: 404, statusMessage: 'Cuenta no encontrada' });
    }
    return await Promise.resolve(account);
  }
}
