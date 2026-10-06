import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

export interface TransactionRowInterface extends TransactionInterface {
  activityName: string;
  activityColor: string;
  accountName: string;
}
