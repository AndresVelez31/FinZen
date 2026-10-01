// Imports
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

// Exports
export interface TransactionRowInterface extends TransactionInterface {
  activityName: string;
  activityColor: string;
  accountName: string;
}
