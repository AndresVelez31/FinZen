// Internal imports
import type { Account } from './account.entity';

// Exports
export const ACCOUNTS: Account[] = [
  {
    id: 1,
    name: 'Bancolombia',
    type: 'Cuenta de ahorros',
    balance: 4250000,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    userId: 1,
  },
  {
    id: 2,
    name: 'Nequi',
    type: 'Billetera digital',
    balance: 380000,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
    userId: 1,
  },
  {
    id: 3,
    name: 'Davivienda',
    type: 'Cuenta corriente',
    balance: 1820000,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-09-28T09:00:00.000Z',
    userId: 1,
  },
  {
    id: 4,
    name: 'Efectivo',
    type: 'Efectivo',
    balance: 150000,
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-10-10T09:00:00.000Z',
    userId: 1,
  },
  {
    id: 5,
    name: 'Daviplata',
    type: 'Billetera digital',
    balance: 215000,
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z',
    userId: 1,
  },
  {
    id: 6,
    name: 'Lulo Bank',
    type: 'Cuenta de ahorros',
    balance: 2600000,
    createdAt: '2026-04-20T09:00:00.000Z',
    updatedAt: '2026-10-12T09:00:00.000Z',
    userId: 1,
  },
];
