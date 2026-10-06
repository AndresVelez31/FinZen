// Imports
import type { TransactionType } from '../enums/transaction-type.enum.js';

// Exports
export class UpdateTransactionDto {
  type?: TransactionType;
  amount?: number;
  date?: string;
  description?: string;
  accountId?: number;
  activityId?: number;
}
