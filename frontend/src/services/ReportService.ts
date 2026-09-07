import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { ActivityService } from '@/services/ActivityService.js';
import { AccountService } from '@/services/AccountService.js';
import { Formatters } from '@/utils/formatters.js';

export interface CumulativeBalancePoint {
  month: string;
  balance: number;
}

export interface BudgetExecutionItem {
  activityId: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
  difference: number;
}

export interface SavingsProgressItem extends ActivityInterface {
  saved: number;
  percent: number;
}

export class ReportService {
  static getUserTransactions(startDate?: string, endDate?: string): TransactionInterface[] {
    const accountIds = AccountService.getAccounts().map((account) => account.id);

    return useTransactionStore().transactions.filter((transaction) => {
      if (!accountIds.includes(transaction.accountId)) return false;
      if (startDate && transaction.date < startDate) return false;
      if (endDate && transaction.date > endDate) return false;
      return true;
    });
  }

  static getExpensesByActivity(
    startDate?: string,
    endDate?: string,
  ): { activityId: number; name: string; color: string; total: number }[] {
    const activities = ActivityService.getActivities();
    const expensesByActivity: { activityId: number; name: string; color: string; total: number }[] =
      [];

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

  static getMonthlyTotals(
    startDate?: string,
    endDate?: string,
  ): { month: string; income: number; expense: number }[] {
    const transactions = this.getUserTransactions(startDate, endDate);
    const monthlyTotals: { month: string; income: number; expense: number }[] = [];

    transactions.forEach((transaction) => {
      const month = Formatters.monthKey(transaction.date);
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

  static getCumulativeBalanceByYear(year: number): CumulativeBalancePoint[] {
    const monthlyTotals = this.getMonthlyTotals(`${year}-01-01`, `${year}-12-31`);

    let runningBalance = 0;

    return Array.from({ length: 12 }, (_, index) => {
      const month = `${year}-${String(index + 1).padStart(2, '0')}`;

      const monthlyTotal = monthlyTotals.find((total) => total.month === month);

      runningBalance += (monthlyTotal?.income ?? 0) - (monthlyTotal?.expense ?? 0);

      return {
        month,
        balance: Math.round(runningBalance),
      };
    });
  }

  static getBudgetExecution(startDate?: string, endDate?: string): BudgetExecutionItem[] {
    const expensesByActivity = this.getExpensesByActivity(startDate, endDate);

    return ActivityService.getActivities()
      .filter((activity) => activity.type === 'expense')
      .map((activity) => {
        const spent =
          expensesByActivity.find((expense) => expense.activityId === activity.id)?.total ?? 0;

        return {
          activityId: activity.id,
          name: activity.name,
          color: activity.color,
          budget: activity.targetAmount,
          spent,
          difference: activity.targetAmount - spent,
        };
      });
  }

  static getSavingsProgress(): SavingsProgressItem[] {
    const expensesByActivity = this.getExpensesByActivity();

    return ActivityService.getActivities()
      .filter((activity) => activity.type === 'savings')
      .map((activity) => {
        const saved =
          expensesByActivity.find((expense) => expense.activityId === activity.id)?.total ?? 0;

        const percent =
          activity.targetAmount > 0
            ? Math.min(100, Math.round((saved / activity.targetAmount) * 100))
            : 0;

        return {
          ...activity,
          saved,
          percent,
        };
      });
  }
}
