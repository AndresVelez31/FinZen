import type { AccountInterface } from '@/interfaces/AccountInterface.js';

export const accountSeeder: AccountInterface[] = [
  {
    id: 'acc-1',
    userId: '1',
    type: 'Ahorros',
    accountNumber: '001-123456-78',
    bank: 'Bancolombia',
    initialBalance: 5000000,
  },
  {
    id: 'acc-2',
    userId: '1',
    type: 'Corriente',
    accountNumber: '002-654321-90',
    bank: 'Davivienda',
    initialBalance: 2500000,
  },
  {
    id: 'acc-3',
    userId: '1',
    type: 'Ahorros',
    accountNumber: '003-987654-12',
    bank: 'Nequi',
    initialBalance: 800000,
  },
  {
    id: 'acc-4',
    userId: '1',
    type: 'Inversión',
    accountNumber: '004-111222-33',
    bank: 'Banco de Bogotá',
    initialBalance: 10000000,
  },
];
