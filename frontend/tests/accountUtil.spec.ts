// External imports
import { describe, expect, it } from 'vitest';

// Internal imports
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { AccountUtil } from '@/utils/AccountUtil.js';

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

describe('AccountUtil', () => {
  const accounts = [buildAccount({}), buildAccount({ id: 20, name: 'Nequi', balance: 500 })];
  const transactions = [
    buildTransaction({ id: 101, type: 'income', amount: 300 }),
    buildTransaction({ id: 102, type: 'expense', amount: 100 }),
    buildTransaction({ id: 103, type: 'expense', amount: 50, accountId: 20 }),
  ];

  it('calculates a balance from the initial balance plus its own transactions', () => {
    expect(AccountUtil.calculateBalance(accounts[0]!, transactions)).toBe(1200);
    expect(AccountUtil.calculateBalance(accounts[1]!, transactions)).toBe(450);
  });

  it('keeps the initial balance when the account has no transactions', () => {
    expect(AccountUtil.calculateBalance(buildAccount({ id: 30 }), transactions)).toBe(1000);
  });

  it('adds up the balance of every account', () => {
    expect(AccountUtil.calculateTotalBalance(accounts, transactions)).toBe(1650);
    expect(AccountUtil.calculateTotalBalance([], transactions)).toBe(0);
  });
});
