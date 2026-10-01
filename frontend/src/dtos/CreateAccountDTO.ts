// Imports
import type { AccountInterface } from '@/interfaces/AccountInterface.js';

// Exports
export type CreateAccountDTO = Omit<AccountInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
