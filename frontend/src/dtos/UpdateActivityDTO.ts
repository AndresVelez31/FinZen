import type { ActivityInterface } from '../interfaces/ActivityInterface';

export type UpdateActivityDTO = Partial<Omit<ActivityInterface, 'id'>>;
