// Internal imports
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { ExpenseBucketInterface } from '@/interfaces/ExpenseBucketInterface.js';
import type { MonthlyTotalInterface } from '@/interfaces/MonthlyTotalInterface.js';
import type { PeriodSummaryInterface } from '@/interfaces/PeriodSummaryInterface.js';
import type { TransactionFilterCriteriaInterface } from '@/interfaces/TransactionFilterCriteriaInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { TransactionRowInterface } from '@/interfaces/TransactionRowInterface.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

const UNKNOWN_ACTIVITY_NAME = 'Otros';
const UNKNOWN_ACTIVITY_COLOR = '#94a3b8';

// Exports
// Queries and aggregations over transactions a view already loaded with
// TransactionService.
export class TransactionUtil {
  // Queries

  /**
   * Filters transactions by activity, account, type, month (format 'MM'),
   * and/or an inclusive ISO date range. Unset criteria are ignored.
   */
  public static filterByCriteria(
    transactions: TransactionInterface[],
    criteria: TransactionFilterCriteriaInterface = {},
  ): TransactionInterface[] {
    return transactions.filter((transaction) => {
      if (criteria.activityId !== undefined && transaction.activityId !== criteria.activityId) {
        return false;
      }
      if (criteria.accountId !== undefined && transaction.accountId !== criteria.accountId) {
        return false;
      }
      if (criteria.type !== undefined && transaction.type !== criteria.type) return false;
      if (criteria.month !== undefined && transaction.date.slice(5, 7) !== criteria.month) {
        return false;
      }
      if (criteria.from !== undefined && transaction.date < criteria.from) return false;
      if (criteria.to !== undefined && transaction.date > criteria.to) return false;
      return true;
    });
  }

  /**
   * Joins each transaction with its account and activity (name and color)
   * through two Maps, instead of a lookup per cell in the template.
   */
  public static attachAccountAndActivity(
    transactions: TransactionInterface[],
    accounts: AccountInterface[],
    activities: ActivityInterface[],
  ): TransactionRowInterface[] {
    const accountsById = new Map(accounts.map((account) => [account.id, account]));
    const activitiesById = new Map(activities.map((activity) => [activity.id, activity]));

    return transactions.map((transaction) => {
      const activity = activitiesById.get(transaction.activityId);
      const account = accountsById.get(transaction.accountId);

      return {
        ...transaction,
        activityName: activity?.name ?? UNKNOWN_ACTIVITY_NAME,
        activityColor: activity?.color ?? UNKNOWN_ACTIVITY_COLOR,
        accountName: account?.name ?? '—',
      };
    });
  }

  /**
   * Distinct years with at least one transaction, plus the current year,
   * sorted descending.
   */
  public static collectAvailableYears(transactions: TransactionInterface[]): number[] {
    const years = new Set(
      transactions.map((transaction) => new Date(transaction.date).getFullYear()),
    );
    years.add(new Date().getFullYear());
    return [...years].sort((currentYear, nextYear) => nextYear - currentYear);
  }

  // Aggregations

  public static summarizeIncomeAndExpense(
    transactions: TransactionInterface[],
  ): PeriodSummaryInterface {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense };
  }

  /**
   * Groups the expenses by activity name, bucketing transactions whose
   * activity is unknown under 'Otros'. Sorted by total, highest first.
   */
  public static groupExpensesByActivity(
    transactions: TransactionInterface[],
    activities: ActivityInterface[],
  ): ExpenseBucketInterface[] {
    const activitiesById = new Map(activities.map((activity) => [activity.id, activity]));
    const totals = new Map<string, ExpenseBucketInterface>();

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const activity = activitiesById.get(transaction.activityId);
        const name = activity?.name ?? UNKNOWN_ACTIVITY_NAME;
        const entry = totals.get(name) ?? {
          name,
          color: activity?.color ?? UNKNOWN_ACTIVITY_COLOR,
          total: 0,
        };
        entry.total += transaction.amount;
        totals.set(name, entry);
      });

    return [...totals.values()].sort(
      (currentEntry, nextEntry) => nextEntry.total - currentEntry.total,
    );
  }

  /**
   * Income and expense totals grouped by month (YYYY-MM), in calendar order.
   */
  public static sumIncomeAndExpenseByMonth(
    transactions: TransactionInterface[],
  ): MonthlyTotalInterface[] {
    const monthlyTotals: MonthlyTotalInterface[] = [];

    transactions.forEach((transaction) => {
      const month = FormattersUtil.extractMonthKey(transaction.date);
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
   * Cumulative net balance (income - expense) at the end of each month of
   * the given year, in calendar order.
   */
  public static accumulateBalanceByMonth(
    transactions: TransactionInterface[],
    year: string | number,
  ): number[] {
    const yearTransactions = TransactionUtil.filterByCriteria(transactions, {
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    });
    const monthlyTotals = TransactionUtil.sumIncomeAndExpenseByMonth(yearTransactions);
    let runningBalance = 0;

    return Array.from({ length: 12 }, (_, index) => {
      const monthValue = String(index + 1).padStart(2, '0');
      const entry = monthlyTotals.find((total) => total.month === `${year}-${monthValue}`);
      runningBalance += (entry?.income ?? 0) - (entry?.expense ?? 0);
      return Math.round(runningBalance);
    });
  }
}
