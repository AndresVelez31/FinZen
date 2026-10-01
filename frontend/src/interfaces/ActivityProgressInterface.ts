// Imports
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';

// Exports
export interface ActivityProgressInterface extends ActivityInterface {
  used: number;
  percent: number;
  over: boolean;
}
