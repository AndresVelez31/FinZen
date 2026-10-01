import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';

export interface ActivityProgressInterface extends ActivityInterface {
  used: number;
  percent: number;
  over: boolean;
}
