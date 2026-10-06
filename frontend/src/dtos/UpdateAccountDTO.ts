// Internal imports
import type { AccountInterface } from '@/interfaces/AccountInterface.js';

// Exports
export type UpdateAccountDTO = Partial<
  Omit<AccountInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
> & {
  id: number;
};
