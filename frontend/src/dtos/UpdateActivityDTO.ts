import type { ActivityInterface } from '../interfaces/ActivityInterface.js';

export type UpdateActivityDTO = Partial<Omit<ActivityInterface, 'id'>>;
