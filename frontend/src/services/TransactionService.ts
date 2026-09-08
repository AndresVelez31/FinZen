import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { CreateTransactionDTO } from '@/dtos/CreateTransactionDTO.js';
import type { UpdateTransactionDTO } from '@/dtos/UpdateTransactionDTO.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { useUserStore } from '@/stores/userstore.js';

export interface TransactionFilterCriteria {
  activityId?: number | undefined;
  accountId?: number | undefined;
  type?: string | undefined;
  month?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

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

  static update(updateTransactionDTO: UpdateTransactionDTO): TransactionInterface | undefined {
    const { id, ...transactionUpdates } = updateTransactionDTO;
    const transactionStore = useTransactionStore();
    const index = transactionStore.transactions.findIndex((transaction) => transaction.id === id);
    if (index === -1) {
      return undefined;
    }

    const transactionToUpdate = transactionStore.transactions[index];
    if (!transactionToUpdate) return undefined;

    if (transactionUpdates.amount !== undefined && transactionUpdates.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0.');
    }

    if (transactionUpdates.accountId !== undefined && !AccountService.getById(transactionUpdates.accountId)) {
      throw new Error('The specified account does not exist.');
    }

    if (transactionUpdates.activityId !== undefined && !ActivityService.getById(transactionUpdates.activityId)) {
      throw new Error('The specified activity does not exist.');
    }

    const cleanDescription =
      transactionUpdates.description !== undefined ? transactionUpdates.description.trim() : transactionToUpdate.description;

    const updatedTransaction: TransactionInterface = {
      ...transactionToUpdate,
      ...transactionUpdates,
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
   * Filters transactions by activity, account, type, month (format 'MM'),
   * and/or an inclusive ISO date range. Every criterion is optional and
   * unset criteria are ignored.
   */
  static filterTransactions(criteria: TransactionFilterCriteria = {}): TransactionInterface[] {
    return this.getAll().filter((transaction) => {
      if (criteria.activityId !== undefined && transaction.activityId !== criteria.activityId) return false;
      if (criteria.accountId !== undefined && transaction.accountId !== criteria.accountId) return false;
      if (criteria.type !== undefined && transaction.type !== criteria.type) return false;
      if (criteria.month !== undefined && transaction.date.slice(5, 7) !== criteria.month) return false;
      if (criteria.from !== undefined && transaction.date < criteria.from) return false;
      if (criteria.to !== undefined && transaction.date > criteria.to) return false;
      return true;
    });
  }
}