// Imports
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

// Exports
// Calculations over accounts a view already loaded with AccountService.
export class AccountUtil {
  /**
   * Current balance of an account: its initial balance plus incomes minus
   * every other movement (expenses and savings) registered on it.
   */
  public static getBalance(
    account: AccountInterface,
    transactions: TransactionInterface[],
  ): number {
    return transactions
      .filter((transaction) => transaction.accountId === account.id)
      .reduce(
        (balance, transaction) =>
          balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
        account.balance,
      );
  }

  public static getTotalBalance(
    accounts: AccountInterface[],
    transactions: TransactionInterface[],
  ): number {
    return accounts.reduce(
      (sum, account) => sum + AccountUtil.getBalance(account, transactions),
      0,
    );
  }
}
