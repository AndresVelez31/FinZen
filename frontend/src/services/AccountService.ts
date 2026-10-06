// Internal imports
import type { CreateAccountDTO } from '@/dtos/CreateAccountDTO.js';
import type { UpdateAccountDTO } from '@/dtos/UpdateAccountDTO.js';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import { BaseService } from '@/services/BaseService.js';

// Exports
// CRUD with the API. Calculations over the loaded accounts live in AccountUtil.
export class AccountService extends BaseService {
  private static readonly PATH = '/accounts';

  public static async getAll(): Promise<AccountInterface[]> {
    return await this.httpGet(this.PATH);
  }

  public static async getById(id: number): Promise<AccountInterface> {
    return await this.httpGet(`${this.PATH}/${id}`);
  }

  public static async create(createAccountDTO: CreateAccountDTO): Promise<AccountInterface> {
    return await this.httpPost(this.PATH, createAccountDTO);
  }

  public static async update(updateAccountDTO: UpdateAccountDTO): Promise<AccountInterface> {
    const { id, ...accountUpdates } = updateAccountDTO;
    return await this.httpPatch(`${this.PATH}/${id}`, accountUpdates);
  }

  // The API also deletes the account's transactions.
  public static async delete(id: number): Promise<void> {
    await this.httpDelete(`${this.PATH}/${id}`);
  }
}
