import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

export const transactionSeeder: TransactionInterface[] = [
  // --- February 2026 ---
  {
    id: 1,
    accountId: 1,
    activityId: 1,
    type: 'expense',
    amount: 185000,
    date: '2026-02-03',
    description: 'Mercado semanal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    accountId: 2,
    activityId: 2,
    type: 'expense',
    amount: 72000,
    date: '2026-02-07',
    description: 'Gasolina',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    accountId: 1,
    activityId: 5,
    type: 'expense',
    amount: 135000,
    date: '2026-02-10',
    description: 'Factura electricidad',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    accountId: 3,
    activityId: 6,
    type: 'savings',
    amount: 400000,
    date: '2026-02-15',
    description: 'Aporte fondo de emergencias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    accountId: 1,
    activityId: 4,
    type: 'expense',
    amount: 65000,
    date: '2026-02-20',
    description: 'Streaming y apps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- March 2026 ---
  {
    id: 6,
    accountId: 1,
    activityId: 1,
    type: 'expense',
    amount: 210000,
    date: '2026-03-02',
    description: 'Mercado mensual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    accountId: 2,
    activityId: 3,
    type: 'expense',
    amount: 55000,
    date: '2026-03-08',
    description: 'Cita médica',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    accountId: 2,
    activityId: 2,
    type: 'expense',
    amount: 80000,
    date: '2026-03-14',
    description: 'Mantenimiento carro',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 9,
    accountId: 3,
    activityId: 7,
    type: 'savings',
    amount: 250000,
    date: '2026-03-16',
    description: 'Ahorro vacaciones diciembre',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 10,
    accountId: 1,
    activityId: 5,
    type: 'expense',
    amount: 150000,
    date: '2026-03-20',
    description: 'Internet y teléfono',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- April 2026 ---
  {
    id: 11,
    accountId: 1,
    activityId: 1,
    type: 'expense',
    amount: 195000,
    date: '2026-04-01',
    description: 'Mercado semanal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 12,
    accountId: 4,
    activityId: 6,
    type: 'savings',
    amount: 800000,
    date: '2026-04-05',
    description: 'Aporte extra fondo emergencias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 13,
    accountId: 2,
    activityId: 4,
    type: 'expense',
    amount: 120000,
    date: '2026-04-12',
    description: 'Concierto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 14,
    accountId: 1,
    activityId: 3,
    type: 'expense',
    amount: 45000,
    date: '2026-04-18',
    description: 'Farmacia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 15,
    accountId: 2,
    activityId: 2,
    type: 'expense',
    amount: 68000,
    date: '2026-04-22',
    description: 'Recarga tarjeta transporte',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- May 2026 ---
  {
    id: 16,
    accountId: 1,
    activityId: 1,
    type: 'expense',
    amount: 220000,
    date: '2026-05-03',
    description: 'Mercado mensual completo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 17,
    accountId: 3,
    activityId: 7,
    type: 'savings',
    amount: 300000,
    date: '2026-05-10',
    description: 'Ahorro vacaciones',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 18,
    accountId: 1,
    activityId: 5,
    type: 'expense',
    amount: 140000,
    date: '2026-05-15',
    description: 'Servicios del mes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 19,
    accountId: 2,
    activityId: 4,
    type: 'expense',
    amount: 90000,
    date: '2026-05-20',
    description: 'Cena con amigos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 20,
    accountId: 4,
    activityId: 6,
    type: 'savings',
    amount: 600000,
    date: '2026-05-28',
    description: 'Transferencia inversión',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- June 2026 ---
  {
    id: 21,
    accountId: 1,
    activityId: 1,
    type: 'expense',
    amount: 175000,
    date: '2026-06-04',
    description: 'Mercado semanal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 22,
    accountId: 2,
    activityId: 3,
    type: 'expense',
    amount: 180000,
    date: '2026-06-09',
    description: 'Dentista',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 23,
    accountId: 2,
    activityId: 2,
    type: 'expense',
    amount: 76000,
    date: '2026-06-15',
    description: 'Gasolina',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 24,
    accountId: 3,
    activityId: 6,
    type: 'savings',
    amount: 350000,
    date: '2026-06-20',
    description: 'Aporte mensual fondo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 25,
    accountId: 1,
    activityId: 4,
    type: 'expense',
    amount: 55000,
    date: '2026-06-26',
    description: 'Plataformas digitales',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- July 2026 ---
  {
    id: 26,
    accountId: 1,
    activityId: 1,
    type: 'expense',
    amount: 205000,
    date: '2026-07-03',
    description: 'Mercado mensual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 27,
    accountId: 1,
    activityId: 5,
    type: 'expense',
    amount: 160000,
    date: '2026-07-10',
    description: 'Factura gas y agua',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 28,
    accountId: 3,
    activityId: 7,
    type: 'savings',
    amount: 500000,
    date: '2026-07-15',
    description: 'Ahorro vacaciones diciembre',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 29,
    accountId: 2,
    activityId: 4,
    type: 'expense',
    amount: 130000,
    date: '2026-07-21',
    description: 'Ropa y accesorios',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 30,
    accountId: 4,
    activityId: 6,
    type: 'savings',
    amount: 750000,
    date: '2026-07-29',
    description: 'Ahorro fin de año',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];
