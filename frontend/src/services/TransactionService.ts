import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { CreateTransactionDTO } from '@/dtos/CreateTransactionDTO.js';
import type { UpdateTransactionDTO } from '@/dtos/UpdateTransactionDTO.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { useUserStore } from '@/stores/userstore.js';

export class TransactionService {
  /**
   * Retrieves all transactions for the active user, ordered by date descending.
   */
  static getTransactions(): TransactionInterface[] {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      return [];
    }

    const userAccounts = AccountService.getAccounts();
    const userAccountIds = new Set(userAccounts.map((account) => account.id));

    const transactions = useTransactionStore().transactions.filter((transaction) =>
      userAccountIds.has(transaction.accountId),
    );

    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  /**
   * Retrieves a specific transaction by its ID.
   */
  static getTransactionById(id: number): TransactionInterface | undefined {
    return useTransactionStore().transactions.find((transaction) => transaction.id === id);
  }

  /**
   * Creates a new transaction with validation and persistence.
   */
  static createTransaction(dto: CreateTransactionDTO): TransactionInterface {
    if (dto.amount === undefined || dto.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0.');
    }

    if (!dto.accountId || !AccountService.getAccountById(dto.accountId)) {
      throw new Error('The specified account does not exist.');
    }

    if (!dto.activityId || !ActivityService.getActivityById(dto.activityId)) {
      throw new Error('The specified activity does not exist.');
    }

    const cleanDescription = dto.description ? dto.description.trim() : '';

    const newTransaction: TransactionInterface = {
      ...dto,
      description: cleanDescription,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useTransactionStore().transactions.push(newTransaction);
    return newTransaction;
  }

  /**
   * Updates an existing transaction.
   */
  static updateTransaction(id: number, dto: UpdateTransactionDTO): TransactionInterface | undefined {
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

    if (dto.accountId !== undefined && !AccountService.getAccountById(dto.accountId)) {
      throw new Error('The specified account does not exist.');
    }

    if (dto.activityId !== undefined && !ActivityService.getActivityById(dto.activityId)) {
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

  /**
   * Deletes a transaction by its ID.
   */
  static deleteTransaction(id: number): void {
    const transactionStore = useTransactionStore();
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.id !== id,
    );
  }

  /**
   * Filters transactions by type ('income' | 'expense').
   */
  static filterByType(type: 'income' | 'expense'): TransactionInterface[] {
    return this.getTransactions().filter((transaction) => transaction.type === type);
  }

  /**
   * Filters transactions by account ID.
   */
  static filterByAccount(accountId: number): TransactionInterface[] {
    return this.getTransactions().filter((transaction) => transaction.accountId === accountId);
  }

  /**
   * Filters transactions by month (format 'YYYY-MM').
   */
  static filterByMonth(monthKey: string): TransactionInterface[] {
    const cleanKey = monthKey.trim();
    return this.getTransactions().filter((transaction) => {
      const txMonthKey = transaction.date.slice(0, 7);
      return txMonthKey === cleanKey;
    });
  }
}