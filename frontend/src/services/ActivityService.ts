import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';
import { useActivityStore } from '@/stores/activitystore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { useUserStore } from '@/stores/userstore.js';

export class ActivityService {
  /**
   * Retrieves all activities for the currently active user.
   */
  static getActivities(): ActivityInterface[] {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      return [];
    }
    return useActivityStore().activities.filter((activity) => activity.userId === currentUserId);
  }

  /**
   * Retrieves a specific activity by its ID.
   */
  static getActivityById(id: number): ActivityInterface | undefined {
    return useActivityStore().activities.find((activity) => activity.id === id);
  }

  /**
   * Creates a new activity for the currently active user.
   */
  static createActivity(dto: CreateActivityDTO): ActivityInterface {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      throw new Error('Cannot create activity: No active user session.');
    }

    const cleanName = dto.name.trim();
    if (!cleanName) throw new Error('Activity name is required.');
    if (!dto.type) throw new Error('Activity type is required.');

    const newActivity: ActivityInterface = {
      ...dto,
      name: cleanName,
      id: Date.now(),
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useActivityStore().activities.push(newActivity);
    return newActivity;
  }

  /**
   * Updates an existing activity.
   */
  static updateActivity(id: number, dto: UpdateActivityDTO): ActivityInterface | undefined {
    const activityStore = useActivityStore();
    const index = activityStore.activities.findIndex((activity) => activity.id === id);
    if (index === -1) {
      return undefined;
    }

    const activityToUpdate = activityStore.activities[index];
    if (!activityToUpdate) return undefined;

    const cleanName = dto.name !== undefined ? dto.name.trim() : activityToUpdate.name;
    if (dto.name !== undefined && !cleanName) throw new Error('Activity name cannot be empty.');
    if (dto.type !== undefined && !dto.type) throw new Error('Activity type cannot be empty.');

    const updatedActivity: ActivityInterface = {
      ...activityToUpdate,
      ...dto,
      name: cleanName,
      updatedAt: new Date().toISOString(),
    };

    activityStore.activities[index] = updatedActivity;
    return updatedActivity;
  }

  /**
   * Deletes an activity and all its associated transactions.
   */
  static deleteActivity(id: number): void {
    const activityStore = useActivityStore();
    const transactionStore = useTransactionStore();

    // Remove the activity
    activityStore.activities = activityStore.activities.filter((activity) => activity.id !== id);

    // Remove all associated transactions
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.activityId !== id,
    );
  }

}
