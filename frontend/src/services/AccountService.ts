import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { CreateAccountDTO } from '@/dtos/CreateAccountDTO.js';
import type { UpdateAccountDTO } from '@/dtos/UpdateAccountDTO.js';
import { useAccountStore } from '@/stores/accountstore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';
import { useUserStore } from '@/stores/userstore.js';

export class AccountService {
  static getAll(): AccountInterface[] {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      return [];
    }
    return useAccountStore().accounts.filter((account) => account.userId === currentUserId);
  }

  static getById(id: number): AccountInterface | undefined {
    return useAccountStore().accounts.find((account) => account.id === id);
  }

  static create(createAccountDTO: CreateAccountDTO): AccountInterface {
    const currentUserId = useUserStore().currentUserId;
    if (!currentUserId) {
      throw new Error('Cannot create account: No active user session.');
    }

    const cleanName = createAccountDTO.name.trim();
    if (!cleanName) throw new Error('Account name is required.');
    if (!createAccountDTO.type) throw new Error('Account type is required.');

    const newAccount: AccountInterface = {
      ...createAccountDTO,
      name: cleanName,
      id: Date.now(),
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAccountStore().accounts.push(newAccount);
    return newAccount;
  }

  static update(updateAccountDTO: UpdateAccountDTO): AccountInterface | undefined {
    const { id, ...accountUpdates } = updateAccountDTO;
    const accountStore = useAccountStore();
    const index = accountStore.accounts.findIndex((account) => account.id === id);
    if (index === -1) {
      return undefined;
    }

    const accountToUpdate = accountStore.accounts[index];
    if (!accountToUpdate) return undefined;

    const cleanName = accountUpdates.name !== undefined ? accountUpdates.name.trim() : accountToUpdate.name;
    if (accountUpdates.name !== undefined && !cleanName) throw new Error('Account name cannot be empty.');
    if (accountUpdates.type !== undefined && !accountUpdates.type) throw new Error('Account type cannot be empty.');

    const updatedAccount: AccountInterface = {
      ...accountToUpdate,
      ...accountUpdates,
      name: cleanName,
      updatedAt: new Date().toISOString(),
    };

    accountStore.accounts[index] = updatedAccount;
    return updatedAccount;
  }

  static delete(id: number): void {
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
   * Calculates the current balance of a specific account based on transactions.
   */
  static getBalance(id: number): number {
    const account = this.getById(id);
    if (!account) {
      return 0;
    }

    const transactions = useTransactionStore().transactions.filter((transaction) => transaction.accountId === id);

    const delta = transactions.reduce((sum, transaction) => {
      // Assuming 'income' increases balance, and anything else (expense, savings) decreases it.
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);

    return account.balance + delta;
  }

  /**
   * Calculates the total balance across all accounts for the current user.
   */
  static getTotalBalance(): number {
    const accounts = this.getAll();
    return accounts.reduce((sum, account) => sum + this.getBalance(account.id), 0);
  }
}
