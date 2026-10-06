// Internal imports
import type { ActivityExpenseEntryInterface } from '@/interfaces/ActivityExpenseEntryInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { ActivityProgressInterface } from '@/interfaces/ActivityProgressInterface.js';
import type { BudgetVsActualInterface } from '@/interfaces/BudgetVsActualInterface.js';
import type { SavingsProgressInterface } from '@/interfaces/SavingsProgressInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { DateRangeUtil } from '@/utils/DateRangeUtil.js';
import { TransactionUtil } from '@/utils/TransactionUtil.js';

// Exports
// Aggregations over activities a view already loaded with ActivityService.
export class ActivityUtil {
  /**
   * Expense totals per activity, optionally bounded by an ISO (YYYY-MM-DD)
   * date range. Only returns activities with at least one expense.
   */
  public static getExpenseTotals(
    activities: ActivityInterface[],
    transactions: TransactionInterface[],
    startDate?: string,
    endDate?: string,
  ): ActivityExpenseEntryInterface[] {
    const periodExpenses = TransactionUtil.filter(transactions, {
      type: 'expense',
      from: startDate,
      to: endDate,
    });
    const expenseTotals: ActivityExpenseEntryInterface[] = [];

    activities.forEach((activity) => {
      const total = periodExpenses
        .filter((transaction) => transaction.activityId === activity.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      if (total > 0) {
        expenseTotals.push({
          activityId: activity.id,
          name: activity.name,
          color: activity.color,
          total,
        });
      }
    });

    return expenseTotals;
  }

  /**
   * Budget vs. actual spend per expense activity, optionally bounded by an
   * ISO (YYYY-MM-DD) date range.
   */
  public static getBudgetVsActual(
    activities: ActivityInterface[],
    transactions: TransactionInterface[],
    startDate?: string,
    endDate?: string,
  ): BudgetVsActualInterface[] {
    const expenseActivities = activities.filter((activity) => activity.type === 'expense');
    const periodExpenses = ActivityUtil.getExpenseTotals(
      activities,
      transactions,
      startDate,
      endDate,
    );

    return expenseActivities.map((activity) => {
      const spent = periodExpenses.find((entry) => entry.activityId === activity.id)?.total ?? 0;
      return {
        activityId: activity.id,
        name: activity.name,
        color: activity.color,
        budget: activity.targetAmount,
        spent,
        diff: activity.targetAmount - spent,
      };
    });
  }

  /**
   * All-time savings goal progress: how much has been put toward each
   * savings activity, as a percentage of its target amount (capped at 100).
   */
  public static getSavingsProgress(
    activities: ActivityInterface[],
    transactions: TransactionInterface[],
  ): SavingsProgressInterface[] {
    const savingsActivities = activities.filter((activity) => activity.type === 'savings');
    const allTimeExpenses = ActivityUtil.getExpenseTotals(activities, transactions);

    return savingsActivities.map((activity) => {
      const saved = allTimeExpenses.find((entry) => entry.activityId === activity.id)?.total ?? 0;
      return {
        id: activity.id,
        name: activity.name,
        color: activity.color,
        targetAmount: activity.targetAmount,
        saved,
        percent: ActivityUtil.getPercent(saved, activity.targetAmount),
      };
    });
  }

  /**
   * Progress of every activity against its target amount. Expense
   * activities (budgets) are measured against the current month to date;
   * savings activities against their all-time total, since a savings goal
   * isn't reset every month the way a budget is.
   */
  public static getProgress(
    activities: ActivityInterface[],
    transactions: TransactionInterface[],
  ): ActivityProgressInterface[] {
    const { start, end } = DateRangeUtil.currentMonthToDate();
    const monthlyExpenses = ActivityUtil.getExpenseTotals(activities, transactions, start, end);
    const allTimeExpenses = ActivityUtil.getExpenseTotals(activities, transactions);

    return activities.map((activity) => {
      const source = activity.type === 'expense' ? monthlyExpenses : allTimeExpenses;
      const used = source.find((entry) => entry.activityId === activity.id)?.total ?? 0;

      return {
        ...activity,
        used,
        percent: ActivityUtil.getPercent(used, activity.targetAmount),
        over: activity.type === 'expense' && used > activity.targetAmount,
      };
    });
  }

  private static getPercent(amount: number, targetAmount: number): number {
    return targetAmount > 0 ? Math.min(100, Math.round((amount / targetAmount) * 100)) : 0;
  }
}
