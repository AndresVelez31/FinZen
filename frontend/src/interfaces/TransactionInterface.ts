export interface TransactionInterface {
  id: number;
  accountId: number;
  activityId: number;
  type: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
