import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { CreateAccountDTO } from '@/dtos/CreateAccountDTO.js';
import type { UpdateAccountDTO } from '@/dtos/UpdateAccountDTO.js';
import { useAccountStore } from '@/stores/accountstore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { useUserStore } from '@/stores/userstore.js';

export class AccountService {
  /**
   * Retrieves all accounts for the currently active user.
   */
  static getAccounts(): AccountInterface[] {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      return [];
    }
    return useAccountStore().accounts.filter((account) => account.userId === currentUserId);
  }

  /**
   * Retrieves a specific account by its ID.
   */
  static getAccountById(id: string): AccountInterface | undefined {
    return useAccountStore().accounts.find((account) => account.id === id);
  }

  /**
   * Creates a new account for the currently active user.
   */
  static createAccount(dto: CreateAccountDTO): AccountInterface {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      throw new Error('Cannot create account: No active user session.');
    }

    const newAccount: AccountInterface = {
      ...dto,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      userId: currentUserId,
    };

    useAccountStore().accounts.push(newAccount);
    return newAccount;
  }

  /**
   * Updates an existing account.
   */
  static updateAccount(id: string, dto: UpdateAccountDTO): AccountInterface | undefined {
    const accountStore = useAccountStore();
    const index = accountStore.accounts.findIndex((account) => account.id === id);
    if (index === -1) {
      return undefined;
    }

    // TypeScript strict mode check
    const accountToUpdate = accountStore.accounts[index];
    if (!accountToUpdate) return undefined;

    const updatedAccount: AccountInterface = {
      ...accountToUpdate,
      ...dto,
    };

    accountStore.accounts[index] = updatedAccount;
    return updatedAccount;
  }

  /**
   * Deletes an account and all its associated transactions.
   */
  static deleteAccount(id: string): void {
    const accountStore = useAccountStore();
    const transactionStore = useTransactionStore();

    // Remove the account
    accountStore.accounts = accountStore.accounts.filter((account) => account.id !== id);

    // Remove all associated transactions
    transactionStore.transactions = transactionStore.transactions.filter(
      (transaction) => transaction.accountId !== id,
    );
  }

  /**
   * Calculates the current balance of a specific account.
   * Logic: initialBalance + Σincome - Σexpenses(or savings)
   */
  static getAccountBalance(id: string): number {
    const account = this.getAccountById(id);
    if (!account) {
      return 0;
    }

    const transactions = useTransactionStore().transactions.filter((transaction) => transaction.accountId === id);

    const delta = transactions.reduce((sum, transaction) => {
      // Assuming 'income' increases balance, and anything else (expense, savings) decreases it.
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);

    return account.initialBalance + delta;
  }

  /**
   * Calculates the total balance across all accounts for the current user.
   */
  static getTotalBalance(): number {
    const accounts = this.getAccounts();
    return accounts.reduce((sum, account) => sum + this.getAccountBalance(account.id), 0);
  }
}
