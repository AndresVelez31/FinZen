// Imports
import type { CreateTransactionDTO } from '@/dtos/CreateTransactionDTO.js';
import type { UpdateTransactionDTO } from '@/dtos/UpdateTransactionDTO.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { BaseService } from '@/services/BaseService.js';

// Exports
// CRUD with the API. Queries and aggregations over the loaded transactions
// live in TransactionUtil.
export class TransactionService extends BaseService {
  private static readonly PATH = '/transactions';

  // The API returns them newest first (by date).
  public static async getAll(): Promise<TransactionInterface[]> {
    return await this.httpGet(this.PATH);
  }

  public static async getById(id: number): Promise<TransactionInterface> {
    return await this.httpGet(`${this.PATH}/${id}`);
  }

  public static async create(
    createTransactionDTO: CreateTransactionDTO,
  ): Promise<TransactionInterface> {
    return await this.httpPost(this.PATH, createTransactionDTO);
  }

  public static async update(
    updateTransactionDTO: UpdateTransactionDTO,
  ): Promise<TransactionInterface> {
    const { id, ...transactionUpdates } = updateTransactionDTO;
    return await this.httpPatch(`${this.PATH}/${id}`, transactionUpdates);
  }

  public static async delete(id: number): Promise<void> {
    await this.httpDelete(`${this.PATH}/${id}`);
  }
}
