// Internal imports
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import { BaseService } from '@/services/BaseService.js';

// Exports
// CRUD with the API. Aggregations over the loaded activities live in ActivityUtil.
export class ActivityService extends BaseService {
  private static readonly PATH = '/activities';

  public static async getAll(): Promise<ActivityInterface[]> {
    return await this.httpGet(this.PATH);
  }

  public static async getById(id: number): Promise<ActivityInterface> {
    return await this.httpGet(`${this.PATH}/${id}`);
  }

  public static async create(createActivityDTO: CreateActivityDTO): Promise<ActivityInterface> {
    return await this.httpPost(this.PATH, createActivityDTO);
  }

  public static async update(updateActivityDTO: UpdateActivityDTO): Promise<ActivityInterface> {
    const { id, ...activityUpdates } = updateActivityDTO;
    return await this.httpPatch(`${this.PATH}/${id}`, activityUpdates);
  }

  // The API also deletes the activity's transactions.
  public static async delete(id: number): Promise<void> {
    await this.httpDelete(`${this.PATH}/${id}`);
  }
}
