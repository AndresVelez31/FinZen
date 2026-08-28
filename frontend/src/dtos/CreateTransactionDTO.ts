import type { TransactionInterface } from '../interfaces/TransactionInterface';

export type CreateTransactionDTO = Omit<TransactionInterface, 'id'>;
