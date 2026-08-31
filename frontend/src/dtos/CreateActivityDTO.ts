import type { ActivityInterface } from '../interfaces/ActivityInterface.js';

export type CreateActivityDTO = Omit<ActivityInterface, 'id' | 'userId'>;
