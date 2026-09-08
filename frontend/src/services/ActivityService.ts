import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';
import { useActivityStore } from '@/stores/activitystore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { useAuthStore } from '@/auth/authstore.js';

export class ActivityService {
  static getAll(): ActivityInterface[] {
    const currentUserId = useAuthStore().currentUserId;
    if (!currentUserId) {
      return [];
    }
    return useActivityStore().activities.filter((activity) => activity.userId === currentUserId);
  }

  // Scoped to the current user: without this check, any authenticated user
  // could load or edit another user's activity by guessing its id in the URL.
  static getById(id: number): ActivityInterface | undefined {
    const currentUserId = useAuthStore().currentUserId;
    return useActivityStore().activities.find(
      (activity) => activity.id === id && activity.userId === currentUserId,
    );
  }

  static create(createActivityDTO: CreateActivityDTO): ActivityInterface {
    const currentUserId = useAuthStore().currentUserId;
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
    const currentUserId = useAuthStore().currentUserId;
    const activityStore = useActivityStore();

    // Ownership check, mirroring getById().
    const index = activityStore.activities.findIndex(
      (activity) => activity.id === id && activity.userId === currentUserId,
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
    const currentUserId = useAuthStore().currentUserId;
    const activityStore = useActivityStore();
    const transactionStore = useTransactionStore();

    // Ownership check, mirroring getById()/update(): silently no-ops on an
    // id that isn't the current user's.
    const activity = activityStore.activities.find(
      (item) => item.id === id && item.userId === currentUserId,
    );
    if (!activity) {
      return;
    }

    activityStore.activities = activityStore.activities.filter((item) => item.id !== id);
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.activityId !== id,
    );
  }
}
