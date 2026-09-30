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
  static async getAll(): Promise<TransactionInterface[]> {
    return await this.httpGet<TransactionInterface[]>(this.PATH);
  }

  static async getById(id: number): Promise<TransactionInterface> {
    return await this.httpGet<TransactionInterface>(`${this.PATH}/${id}`);
  }

  static async create(createTransactionDTO: CreateTransactionDTO): Promise<TransactionInterface> {
    return await this.httpPost<TransactionInterface>(this.PATH, createTransactionDTO);
  }

  static async update(updateTransactionDTO: UpdateTransactionDTO): Promise<TransactionInterface> {
    const { id, ...transactionUpdates } = updateTransactionDTO;
    return await this.httpPatch<TransactionInterface>(`${this.PATH}/${id}`, transactionUpdates);
  }

  static async delete(id: number): Promise<void> {
    await this.httpDelete(`${this.PATH}/${id}`);
  }
}
