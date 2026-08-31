import type { TransactionInterface } from '../interfaces/TransactionInterface.js';

export type UpdateTransactionDTO = Partial<Omit<TransactionInterface, 'id'>>;
