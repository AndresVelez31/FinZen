// Imports
import type { ActivityType } from '../enums/activity-type.enum.js';

// Exports
export class CreateActivityDto {
  name: string;
  color: string;
  type: ActivityType;
  targetAmount: number;
}
