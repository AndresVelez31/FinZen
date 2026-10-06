// Internal imports
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

// Exports
export type CreateTransactionDTO = Omit<TransactionInterface, 'id' | 'updatedAt'>;
