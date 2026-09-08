import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import { TransactionService } from '@/services/TransactionService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { Formatters } from '@/utils/formatters.js';
import { DateRange } from '@/utils/DateRange.js';

export interface ActivityProgress extends ActivityInterface {
  used: number;
  percent: number;
  over: boolean;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface MonthlyTotal {
  month: string;
  income: number;
  expense: number;
}

export interface ActivityExpenseEntry {
  activityId: number;
  name: string;
  color: string;
  total: number;
}

export interface ExpenseBucket {
  name: string;
  color: string;
  total: number;
}

export interface BudgetVsActual {
  activityId: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
  diff: number;
}

export interface SavingsProgress {
  id: number;
  name: string;
  color: string;
  targetAmount: number;
  saved: number;
  percent: number;
}
export class ReportAnalytics {
  // Queries

  /**
   * Transactions for the currently active user, optionally bounded by an
   * ISO (YYYY-MM-DD) date range (inclusive on both ends).
   */
  static getUserTransactions(startDate?: string, endDate?: string): TransactionInterface[] {
    return TransactionService.filterTransactions({ from: startDate, to: endDate });
  }

  // Aggregations

  /**
   * Groups expense totals by activity, for the currently active user,
   * optionally bounded by an ISO (YYYY-MM-DD) date range.
   * Only returns activities that have at least one expense in the period.
   */
  static getExpensesByActivity(startDate?: string, endDate?: string): ActivityExpenseEntry[] {
    const activities = ActivityService.getAll();
    const transactions = this.getUserTransactions(startDate, endDate);
    const expensesByActivity: ActivityExpenseEntry[] = [];

    activities.forEach((activity) => {
      const activityExpenses = transactions.filter(
        (transaction) => transaction.activityId === activity.id && transaction.type === 'expense',
      );
      const total = activityExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);

      if (total > 0) {
        expensesByActivity.push({ activityId: activity.id, name: activity.name, color: activity.color, total });
      }
    });

    return expensesByActivity;
  }

  /**
   * Groups an arbitrary set of transactions' expenses by activity name,
   * bucketing transactions whose activity no longer exists under 'Otros'.
   */
  static aggregateExpensesByActivity(transactions: TransactionInterface[]): ExpenseBucket[] {
    const totals = new Map<string, ExpenseBucket>();

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const activity = ActivityService.getById(transaction.activityId);
        const name = activity ? activity.name : 'Otros';
        const entry = totals.get(name) ?? { name, color: activity?.color ?? '#94a3b8', total: 0 };
        entry.total += transaction.amount;
        totals.set(name, entry);
      });

    return [...totals.values()].sort((currentEntry, nextEntry) => nextEntry.total - currentEntry.total);
  }

  /**
   * Groups income and expense totals by month (YYYY-MM), for the currently active user,
   * optionally bounded by an ISO (YYYY-MM-DD) date range.
   */
  static getMonthlyTotals(startDate?: string, endDate?: string): MonthlyTotal[] {
    const transactions = this.getUserTransactions(startDate, endDate);
    const monthlyTotals: MonthlyTotal[] = [];

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

    return monthlyTotals.sort((currentMonth, nextMonth) => (currentMonth.month > nextMonth.month ? 1 : -1));
  }

  /**
   * Calculates the flat total of incomes, expenses, and net balance for an
   * arbitrary set of transactions.
   */
  static summarize(transactions: TransactionInterface[]): PeriodSummary {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense };
  }

  // Report-ready views

  /**
   * Calculates the flat total of incomes, expenses, and net balance for the current user,
   * optionally bounded by an ISO (YYYY-MM-DD) date range.
   */
  static getPeriodSummary(startDate?: string, endDate?: string): PeriodSummary {
    return this.summarize(this.getUserTransactions(startDate, endDate));
  }

  /**
   * Distinct years with at least one transaction for the current user, plus
   * the current year, sorted descending.
   */
  static getAvailableYears(): number[] {
    const years = new Set(this.getUserTransactions().map((transaction) => new Date(transaction.date).getFullYear()));
    years.add(new Date().getFullYear());
    return [...years].sort((currentYear, nextYear) => nextYear - currentYear);
  }

  /**
   * Cumulative net balance (income - expense) at the end of each month of
   * the given year, in calendar order.
   */
  static getCumulativeBalanceByMonth(year: string | number): number[] {
    const monthlyTotals = this.getMonthlyTotals(`${year}-01-01`, `${year}-12-31`);
    let running = 0;

    return Array.from({ length: 12 }, (_, index) => {
      const monthValue = String(index + 1).padStart(2, '0');
      const entry = monthlyTotals.find((total) => total.month === `${year}-${monthValue}`);
      running += (entry?.income ?? 0) - (entry?.expense ?? 0);
      return Math.round(running);
    });
  }

  /**
   * Budget vs. actual spend per expense activity, optionally bounded by an
   * ISO (YYYY-MM-DD) date range.
   */
  static getBudgetVsActual(startDate?: string, endDate?: string): BudgetVsActual[] {
    const expenseActivities = ActivityService.getAll().filter((activity) => activity.type === 'expense');
    const periodExpenses = this.getExpensesByActivity(startDate, endDate);

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
  static getSavingsProgress(): SavingsProgress[] {
    const savingsActivities = ActivityService.getAll().filter((activity) => activity.type === 'savings');
    const allTimeExpenses = this.getExpensesByActivity();

    return savingsActivities.map((activity) => {
      const saved = allTimeExpenses.find((entry) => entry.activityId === activity.id)?.total ?? 0;
      const percent =
        activity.targetAmount > 0 ? Math.min(100, Math.round((saved / activity.targetAmount) * 100)) : 0;
      return {
        id: activity.id,
        name: activity.name,
        color: activity.color,
        targetAmount: activity.targetAmount,
        saved,
        percent,
      };
    });
  }

  /**
   * Progress for every activity against its target amount. Expense
   * activities (budgets) are measured against the current month to date;
   * savings activities are measured against their all-time total, since a
   * savings goal isn't reset every month the way a budget is.
   */
  static getActivityProgress(): ActivityProgress[] {
    const activities = ActivityService.getAll();
    const { start, end } = DateRange.currentMonthToDate();
    const monthlyExpenses = this.getExpensesByActivity(start, end);
    const allTimeExpenses = this.getExpensesByActivity();

    return activities.map((activity) => {
      const source = activity.type === 'expense' ? monthlyExpenses : allTimeExpenses;
      const used = source.find((entry) => entry.activityId === activity.id)?.total ?? 0;
      const percent =
        activity.targetAmount > 0 ? Math.min(100, Math.round((used / activity.targetAmount) * 100)) : 0;

      return {
        ...activity,
        used,
        percent,
        over: activity.type === 'expense' && used > activity.targetAmount,
      };
    });
  }
}
