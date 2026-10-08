// Exports
// What the user picked in the transaction filters, as the selects and date pickers hold it ('' = any).
export interface TransactionFiltersInterface {
  activityId: string;
  accountId: string;
  type: string;
  month: string;
  from: string;
  to: string;
}
