import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';
import { useActivityStore } from '@/stores/activitystore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { useUserStore } from '@/stores/userstore.js';

export class ActivityService {
  static getAll(): ActivityInterface[] {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      return [];
    }
    return useActivityStore().activities.filter((activity) => activity.userId === currentUserId);
  }

  static getById(id: number): ActivityInterface | undefined {
    return useActivityStore().activities.find((activity) => activity.id === id);
  }

  static create(createActivityDTO: CreateActivityDTO): ActivityInterface {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
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
    const index = activityStore.activities.findIndex((activity) => activity.id === id);
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

    // Remove the activity
    activityStore.activities = activityStore.activities.filter((activity) => activity.id !== id);

    // Remove all associated transactions
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.activityId !== id,
    );
  }
}
