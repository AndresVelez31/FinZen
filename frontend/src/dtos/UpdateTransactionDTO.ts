// Internal imports
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

// Exports
export type UpdateTransactionDTO = Partial<Omit<TransactionInterface, 'id' | 'updatedAt'>> & {
  id: number;
};
