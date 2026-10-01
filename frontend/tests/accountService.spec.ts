import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { AccountService } from '@/services/AccountService.js';
import { useAccountStore } from '@/stores/accountstore.js';
import { useAuthStore } from '@/stores/authstore.js';
import { useTransactionStore } from '@/stores/transactionstore.js';

const TIMESTAMP = '2026-01-01T00:00:00.000Z';

const buildAccount = (overrides: Partial<AccountInterface>): AccountInterface => ({
  id: 10,
  name: 'Bancolombia',
  type: 'Ahorros',
  balance: 1000,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  userId: 1,
  ...overrides,
});

const buildTransaction = (overrides: Partial<TransactionInterface>): TransactionInterface => ({
  id: 100,
  type: 'income',
  amount: 0,
  date: '2026-01-15',
  description: '',
  updatedAt: TIMESTAMP,
  accountId: 10,
  activityId: 1,
  ...overrides,
});

describe('AccountService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useAuthStore().currentUser = {
      id: 1,
      name: 'Admin',
      role: 'admin',
      email: 'admin@finzen.app',
      password: '',
      active: true,
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    };
    useAccountStore().accounts = [
      buildAccount({}),
      buildAccount({ id: 20, name: 'Nequi', balance: 500 }),
      buildAccount({ id: 30, name: 'Cuenta ajena', userId: 2 }),
    ];
    useTransactionStore().transactions = [
      buildTransaction({ id: 101, type: 'income', amount: 300 }),
      buildTransaction({ id: 102, type: 'expense', amount: 100 }),
      buildTransaction({ id: 103, type: 'expense', amount: 50, accountId: 20 }),
    ];
  });

  it('only returns accounts owned by the current user', () => {
    expect(AccountService.getAll().map((account) => account.id)).toEqual([10, 20]);
    expect(AccountService.getById(30)).toBeUndefined();
  });

  it('creates an account with a trimmed name for the current user', () => {
    const account = AccountService.create({
      name: '  Davivienda  ',
      type: 'Corriente',
      balance: 0,
    });

    expect(account.name).toBe('Davivienda');
    expect(account.userId).toBe(1);
    expect(useAccountStore().accounts).toContainEqual(account);
  });

  it('rejects invalid accounts', () => {
    expect(() => AccountService.create({ name: '   ', type: 'Corriente', balance: 0 })).toThrow(
      'Account name is required.',
    );
    expect(() => AccountService.create({ name: 'Nu', type: 'Digital', balance: -1 })).toThrow(
      'Account balance must be zero or greater.',
    );
  });

  it('calculates balances from the initial balance plus transactions', () => {
    expect(AccountService.getBalance(10)).toBe(1200);
    expect(AccountService.getBalance(30)).toBe(0);
    expect(AccountService.getTotalBalance()).toBe(1650);
  });

  it('deletes an owned account together with its transactions', () => {
    AccountService.delete(10);

    expect(AccountService.getById(10)).toBeUndefined();
    expect(useTransactionStore().transactions.map((transaction) => transaction.id)).toEqual([103]);
  });

  it('does not delete accounts owned by another user', () => {
    AccountService.delete(30);

    expect(useAccountStore().accounts).toHaveLength(3);
  });
});
