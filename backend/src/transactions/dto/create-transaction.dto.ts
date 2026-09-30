// Exports
export class CreateTransactionDto {
  type: string;
  amount: number;
  date: string;
  description: string;
  accountId: number;
  activityId: number;
}
