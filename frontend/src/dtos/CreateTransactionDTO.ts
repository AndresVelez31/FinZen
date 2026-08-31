import type { TransactionInterface } from '../interfaces/TransactionInterface.js';

export type CreateTransactionDTO = Omit<TransactionInterface, 'id' | 'userId'>;
