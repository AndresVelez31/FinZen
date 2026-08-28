import type { TransactionInterface } from '../interfaces/TransactionInterface';

export type UpdateTransactionDTO = Partial<Omit<TransactionInterface, 'id'>>;
