import type { ActivityInterface } from '../interfaces/ActivityInterface';

export type CreateActivityDTO = Omit<ActivityInterface, 'id'>;
