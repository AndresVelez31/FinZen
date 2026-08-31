import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { ActivityService } from '@/services/ActivityService.js';
import { AccountService } from '@/services/AccountService.js';

export class ReportService {
  /**
   * Retrieves transactions belonging to the currently active user, optionally
   * bounded by an ISO (YYYY-MM-DD) date range (inclusive on both ends).
   * Scoping is done via account ownership, since transactions have no direct userId.
   */
  static getUserTransactions(startDate?: string, endDate?: string): TransactionInterface[] {
    const accountIds = AccountService.getAccounts().map((account) => account.id);

    return useTransactionStore().transactions.filter((transaction) => {
      if (!accountIds.includes(transaction.accountId)) return false;
      if (startDate && transaction.date < startDate) return false;
      if (endDate && transaction.date > endDate) return false;
      return true;
    });
  }

  /**
   * Groups expense totals by activity, for the currently active user,
   * optionally bounded by an ISO (YYYY-MM-DD) date range.
   * Only returns activities that have at least one expense in the period.
   */
  static getExpensesByActivity(
    startDate?: string,
    endDate?: string,
  ): { activityId: number; name: string; color: string; total: number }[] {
    const activities = ActivityService.getActivities();
    const expensesByActivity: { activityId: number; name: string; color: string; total: number }[] = [];

    activities.forEach((activity) => {
      const activityExpenses = this.getUserTransactions(startDate, endDate).filter(
        (transaction) => transaction.activityId === activity.id && transaction.type === 'expense',
      );
      const total = activityExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);

      if (total > 0) {
        expensesByActivity.push({
          activityId: activity.id,
          name: activity.name,
          color: activity.color,
          total,
        });
      }
    });

    return expensesByActivity;
  }

  /**
   * Groups income and expense totals by month (YYYY-MM), for the currently active user,
   * optionally bounded by an ISO (YYYY-MM-DD) date range.
   */
  static getMonthlyTotals(
    startDate?: string,
    endDate?: string,
  ): { month: string; income: number; expense: number }[] {
    const transactions = this.getUserTransactions(startDate, endDate);
    const monthlyTotals: { month: string; income: number; expense: number }[] = [];

    transactions.forEach((transaction) => {
      const month = transaction.date.slice(0, 7);
      let monthEntry = monthlyTotals.find((total) => total.month === month);
      if (!monthEntry) {
        monthEntry = { month, income: 0, expense: 0 };
        monthlyTotals.push(monthEntry);
      }

      if (transaction.type === 'income') {
        monthEntry.income += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthEntry.expense += transaction.amount;
      }
    });

    return monthlyTotals.sort((currentMonth, nextMonth) =>
      currentMonth.month > nextMonth.month ? 1 : -1,
    );
  }

  /**
   * Calculates the flat total of incomes, expenses, and net balance for the current user,
   * optionally bounded by an ISO (YYYY-MM-DD) date range.
   */
  static getPeriodSummary(
    startDate?: string,
    endDate?: string,
  ): { totalIncome: number; totalExpense: number; netBalance: number } {
    const transactions = this.getUserTransactions(startDate, endDate);

    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  }
}
