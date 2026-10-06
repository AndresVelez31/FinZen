// Internal imports
import type { ActivityType } from '../enums/activity-type.enum.js';

// Exports
export class UpdateActivityDto {
  name?: string;
  color?: string;
  type?: ActivityType;
  targetAmount?: number;
}
