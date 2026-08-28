export interface TransactionInterface {
  id: string;
  userId: string;
  accountId: string;
  activityId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}
