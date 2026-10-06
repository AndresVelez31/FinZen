// Imports
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { BaseService } from '@/services/BaseService.js';

// Exports
export class UserService extends BaseService {
  private static readonly PATH = '/users';

  public static async getAll(): Promise<UserInterface[]> {
    return await this.httpGet(this.PATH);
  }

  public static async update(updateUserDTO: UpdateUserDTO): Promise<UserInterface> {
    const { id, ...userUpdates } = updateUserDTO;
    return await this.httpPatch(`${this.PATH}/${id}`, userUpdates);
  }
}
