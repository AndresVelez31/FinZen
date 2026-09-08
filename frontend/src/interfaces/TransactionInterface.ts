export interface TransactionInterface {
  id: number;
  type: string;
  amount: number;
  date: string;
  description: string;
  updatedAt: string;

  accountId: number;
  activityId: number;
}
