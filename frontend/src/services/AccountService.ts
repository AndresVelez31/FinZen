// Imports
import type { CreateAccountDTO } from '@/dtos/CreateAccountDTO.js';
import type { UpdateAccountDTO } from '@/dtos/UpdateAccountDTO.js';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import { BaseService } from '@/services/BaseService.js';

// Exports
// CRUD with the API. Calculations over the loaded accounts live in AccountUtil.
export class AccountService extends BaseService {
  private static readonly PATH = '/accounts';

  static async getAll(): Promise<AccountInterface[]> {
    return await this.httpGet(this.PATH);
  }

  static async getById(id: number): Promise<AccountInterface> {
    return await this.httpGet(`${this.PATH}/${id}`);
  }

  static async create(createAccountDTO: CreateAccountDTO): Promise<AccountInterface> {
    return await this.httpPost(this.PATH, createAccountDTO);
  }

  static async update(updateAccountDTO: UpdateAccountDTO): Promise<AccountInterface> {
    const { id, ...accountUpdates } = updateAccountDTO;
    return await this.httpPatch(`${this.PATH}/${id}`, accountUpdates);
  }

  // The API also deletes the account's transactions.
  static async delete(id: number): Promise<void> {
    await this.httpDelete(`${this.PATH}/${id}`);
  }
}
