import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { CreateTransactionDTO } from '@/dtos/CreateTransactionDTO.js';
import type { UpdateTransactionDTO } from '@/dtos/UpdateTransactionDTO.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { useUserStore } from '@/stores/userstore.js';

export class TransactionService {
  static getAll(): TransactionInterface[] {

    const userAccounts = AccountService.getAll();
    const userAccountIds = new Set(userAccounts.map((account) => account.id));

    const transactions = useTransactionStore().transactions.filter((transaction) =>
      userAccountIds.has(transaction.accountId),
    );

    return [...transactions].sort(
      (currentTransaction, nextTransaction) =>
        new Date(nextTransaction.date).getTime() - new Date(currentTransaction.date).getTime(),
    );
  }

  static getById(id: number): TransactionInterface | undefined {
    return useTransactionStore().transactions.find((transaction) => transaction.id === id);
  }

  static create(createTransactionDTO: CreateTransactionDTO): TransactionInterface {
    if (createTransactionDTO.amount === undefined || createTransactionDTO.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0.');
    }

    if (!createTransactionDTO.accountId || !AccountService.getById(createTransactionDTO.accountId)) {
      throw new Error('The specified account does not exist.');
    }

    if (!createTransactionDTO.activityId || !ActivityService.getById(createTransactionDTO.activityId)) {
      throw new Error('The specified activity does not exist.');
    }

    const cleanDescription = createTransactionDTO.description ? createTransactionDTO.description.trim() : '';

    const newTransaction: TransactionInterface = {
      ...createTransactionDTO,
      description: cleanDescription,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useTransactionStore().transactions.push(newTransaction);
    return newTransaction;
  }

  static update(id: number, dto: UpdateTransactionDTO): TransactionInterface | undefined {
    const transactionStore = useTransactionStore();
    const index = transactionStore.transactions.findIndex((transaction) => transaction.id === id);
    if (index === -1) {
      return undefined;
    }

    const txToUpdate = transactionStore.transactions[index];
    if (!txToUpdate) return undefined;

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0.');
    }

    if (dto.accountId !== undefined && !AccountService.getById(dto.accountId)) {
      throw new Error('The specified account does not exist.');
    }

    if (dto.activityId !== undefined && !ActivityService.getById(dto.activityId)) {
      throw new Error('The specified activity does not exist.');
    }

    const cleanDescription =
      dto.description !== undefined ? dto.description.trim() : txToUpdate.description;

    const updatedTransaction: TransactionInterface = {
      ...txToUpdate,
      ...dto,
      description: cleanDescription,
      updatedAt: new Date().toISOString(),
    };

    transactionStore.transactions[index] = updatedTransaction;
    return updatedTransaction;
  }

  static delete(id: number): void {
    const transactionStore = useTransactionStore();
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.id !== id,
    );
  }

  /**
   * Filters transactions by type ('income' | 'expense').
   */
  static filterByType(type: 'income' | 'expense'): TransactionInterface[] {
    return this.getAll().filter((transaction) => transaction.type === type);
  }

  /**
   * Filters transactions by account ID.
   */
  static filterByAccount(accountId: number): TransactionInterface[] {
    return this.getAll().filter((transaction) => transaction.accountId === accountId);
  }

  /**
   * Filters transactions by month (format 'YYYY-MM').
   */
  static filterByMonth(monthKey: string): TransactionInterface[] {
    const cleanKey = monthKey.trim();
    return this.getAll().filter((transaction) => {
      const txMonthKey = transaction.date.slice(0, 7);
      return txMonthKey === cleanKey;
    });
  }
}