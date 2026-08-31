import type { AccountInterface } from '../interfaces/AccountInterface.js';

export type CreateAccountDTO = Omit<AccountInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
