import type { AccountInterface } from '@/interfaces/AccountInterface.js';

export const accountSeeder: AccountInterface[] = [
  {
    id: 1,
    userId: 1,
    name: 'Bancolombia',
    type: 'Ahorros',
    balance: 5000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    name: 'Davivienda',
    type: 'Corriente',
    balance: 2500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    name: 'Nequi',
    type: 'Ahorros',
    balance: 800000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    userId: 1,
    name: 'Banco de Bogotá',
    type: 'Inversión',
    balance: 10000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
