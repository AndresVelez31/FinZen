// Imports
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';

// Exports
export type CreateActivityDTO = Omit<
  ActivityInterface,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;
