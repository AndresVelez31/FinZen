import type { AccountInterface } from '@/interfaces/AccountInterface.js';

export const accountSeeder: AccountInterface[] = [
  {
    id: 1,
    userId: 1,
    name: 'Cuenta Principal',
    type: 'Ahorros',
    balance: 5000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    name: 'Gastos Diarios',
    type: 'Corriente',
    balance: 2500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    name: 'Fondo de Emergencia',
    type: 'Ahorros',
    balance: 800000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    userId: 1,
    name: 'Inversiones a Largo Plazo',
    type: 'Inversión',
    balance: 10000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
