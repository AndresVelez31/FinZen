// Imports
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';

// Exports
export type UpdateActivityDTO = Partial<
  Omit<ActivityInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
> & {
  id: number;
};
