import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';
import { useActivityStore } from '@/stores/activitystore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { AuthService } from '@/services/AuthService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { DateRange } from '@/utils/DateRangeUtil.js';

export interface ActivityProgress extends ActivityInterface {
  used: number;
  percent: number;
  over: boolean;
}

export interface ActivityExpenseEntry {
  activityId: number;
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

export class ActivityService {
  static getAll(): ActivityInterface[] {
    return useActivityStore().activities.filter((activity) => AuthService.isOwner(activity.userId));
  }

  static getById(id: number): ActivityInterface | undefined {
    return useActivityStore().activities.find(
      (activity) => activity.id === id && AuthService.isOwner(activity.userId),
    );
  }

  static create(createActivityDTO: CreateActivityDTO): ActivityInterface {
    const currentUserId = AuthService.getCurrentUserId();
    if (currentUserId === null) {
      throw new Error('Cannot create activity: No active user session.');
    }

    const cleanName = createActivityDTO.name.trim();
    if (!cleanName) throw new Error('Activity name is required.');
    if (!createActivityDTO.type) throw new Error('Activity type is required.');

    const newActivity: ActivityInterface = {
      ...createActivityDTO,
      name: cleanName,
      id: Date.now(),
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useActivityStore().activities.push(newActivity);
    return newActivity;
  }

  static update(updateActivityDTO: UpdateActivityDTO): ActivityInterface | undefined {
    const { id, ...activityUpdates } = updateActivityDTO;
    const activityStore = useActivityStore();

    const index = activityStore.activities.findIndex(
      (activity) => activity.id === id && AuthService.isOwner(activity.userId),
    );
    if (index === -1) {
      return undefined;
    }

    const activityToUpdate = activityStore.activities[index];
    if (!activityToUpdate) return undefined;

    const cleanName = activityUpdates.name !== undefined ? activityUpdates.name.trim() : activityToUpdate.name;
    if (activityUpdates.name !== undefined && !cleanName) throw new Error('Activity name cannot be empty.');
    if (activityUpdates.type !== undefined && !activityUpdates.type) throw new Error('Activity type cannot be empty.');

    const updatedActivity: ActivityInterface = {
      ...activityToUpdate,
      ...activityUpdates,
      name: cleanName,
      updatedAt: new Date().toISOString(),
    };

    activityStore.activities[index] = updatedActivity;
    return updatedActivity;
  }

  static delete(id: number): void {
    const activityStore = useActivityStore();
    const transactionStore = useTransactionStore();

    const activity = activityStore.activities.find(
      (item) => item.id === id && AuthService.isOwner(item.userId),
    );
    if (!activity) {
      return;
    }

    activityStore.activities = activityStore.activities.filter((item) => item.id !== id);
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.activityId !== id,
    );
  }

  // Aggregations

  /**
   * Expense totals per activity, for the currently active user, optionally
   * bounded by an ISO (YYYY-MM-DD) date range.
   * Only returns activities that have at least one expense in the period.
   */
  static getExpenseTotals(startDate?: string, endDate?: string): ActivityExpenseEntry[] {
    const activities = this.getAll();
    const transactions = TransactionService.getByDateRange(startDate, endDate);
    const expenseTotals: ActivityExpenseEntry[] = [];

    activities.forEach((activity) => {
      const activityExpenses = transactions.filter(
        (transaction) => transaction.activityId === activity.id && transaction.type === 'expense',
      );
      const total = activityExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);

      if (total > 0) {
        expenseTotals.push({ activityId: activity.id, name: activity.name, color: activity.color, total });
      }
    });

    return expenseTotals;
  }

  /**
   * Budget vs. actual spend per expense activity, optionally bounded by an
   * ISO (YYYY-MM-DD) date range.
   */
  static getBudgetVsActual(startDate?: string, endDate?: string): BudgetVsActual[] {
    const expenseActivities = this.getAll().filter((activity) => activity.type === 'expense');
    const periodExpenses = this.getExpenseTotals(startDate, endDate);

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
    const savingsActivities = this.getAll().filter((activity) => activity.type === 'savings');
    const allTimeExpenses = this.getExpenseTotals();

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
  static getProgress(): ActivityProgress[] {
    const activities = this.getAll();
    const { start, end } = DateRange.currentMonthToDate();
    const monthlyExpenses = this.getExpenseTotals(start, end);
    const allTimeExpenses = this.getExpenseTotals();

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
