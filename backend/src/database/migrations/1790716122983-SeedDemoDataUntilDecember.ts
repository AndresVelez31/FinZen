// External imports
import type { MigrationInterface, QueryRunner } from 'typeorm';

// Demo transactions for October to December 2026, so every month of the year
// from February has data. They use the accounts and activities of
// SeedDemoData. A new migration instead of editing SeedDemoData: a database
// that already ran it gets these rows on its next start. The rows have no fixed
// id, so they never collide with transactions created on a running database.
const TRANSACTIONS = [
  // Admin Demo (accounts 1-4, activities 1-7)
  {
    type: 'income',
    amount: 3000000,
    date: '2026-10-01',
    description: 'Pago de nómina',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 240000,
    date: '2026-10-04',
    description: 'Mercado mensual',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 88000,
    date: '2026-10-09',
    description: 'Gasolina',
    accountId: 2,
    activityId: 2,
  },
  {
    type: 'expense',
    amount: 165000,
    date: '2026-10-12',
    description: 'Internet y servicios',
    accountId: 1,
    activityId: 5,
  },
  {
    type: 'expense',
    amount: 95000,
    date: '2026-10-18',
    description: 'Cine y cena',
    accountId: 3,
    activityId: 4,
  },
  {
    type: 'expense',
    amount: 120000,
    date: '2026-10-22',
    description: 'Cita médica',
    accountId: 2,
    activityId: 3,
  },
  {
    type: 'expense',
    amount: 400000,
    date: '2026-10-28',
    description: 'Ahorro del mes',
    accountId: 3,
    activityId: 6,
  },

  {
    type: 'income',
    amount: 3000000,
    date: '2026-11-01',
    description: 'Pago de nómina',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 255000,
    date: '2026-11-05',
    description: 'Mercado mensual',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 92000,
    date: '2026-11-10',
    description: 'Gasolina',
    accountId: 2,
    activityId: 2,
  },
  {
    type: 'expense',
    amount: 168000,
    date: '2026-11-12',
    description: 'Internet y servicios',
    accountId: 1,
    activityId: 5,
  },
  {
    type: 'expense',
    amount: 180000,
    date: '2026-11-20',
    description: 'Concierto',
    accountId: 3,
    activityId: 4,
  },
  {
    type: 'expense',
    amount: 400000,
    date: '2026-11-25',
    description: 'Ahorro del mes',
    accountId: 3,
    activityId: 6,
  },
  {
    type: 'expense',
    amount: 500000,
    date: '2026-11-28',
    description: 'Ahorro vacaciones',
    accountId: 4,
    activityId: 7,
  },

  {
    type: 'income',
    amount: 3000000,
    date: '2026-12-01',
    description: 'Pago de nómina',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 310000,
    date: '2026-12-05',
    description: 'Mercado mensual',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 95000,
    date: '2026-12-08',
    description: 'Gasolina',
    accountId: 2,
    activityId: 2,
  },
  {
    type: 'expense',
    amount: 170000,
    date: '2026-12-12',
    description: 'Internet y servicios',
    accountId: 1,
    activityId: 5,
  },
  {
    type: 'income',
    amount: 1500000,
    date: '2026-12-15',
    description: 'Prima de diciembre',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 350000,
    date: '2026-12-18',
    description: 'Regalos de Navidad',
    accountId: 2,
    activityId: 4,
  },
  {
    type: 'expense',
    amount: 220000,
    date: '2026-12-20',
    description: 'Cena de Navidad',
    accountId: 1,
    activityId: 1,
  },
  {
    type: 'expense',
    amount: 600000,
    date: '2026-12-27',
    description: 'Ahorro vacaciones',
    accountId: 4,
    activityId: 7,
  },
  {
    type: 'expense',
    amount: 400000,
    date: '2026-12-28',
    description: 'Ahorro del mes',
    accountId: 3,
    activityId: 6,
  },

  // Usuario Demo (accounts 5-8, activities 8-14)
  {
    type: 'income',
    amount: 2400000,
    date: '2026-10-01',
    description: 'Salario mensual',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 225000,
    date: '2026-10-03',
    description: 'Mercado mensual',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 60000,
    date: '2026-10-07',
    description: 'Gasolina',
    accountId: 6,
    activityId: 9,
  },
  {
    type: 'expense',
    amount: 100000,
    date: '2026-10-10',
    description: 'Internet y servicios',
    accountId: 5,
    activityId: 12,
  },
  {
    type: 'expense',
    amount: 90000,
    date: '2026-10-16',
    description: 'Salida con amigos',
    accountId: 8,
    activityId: 10,
  },
  {
    type: 'expense',
    amount: 45000,
    date: '2026-10-21',
    description: 'Farmacia',
    accountId: 8,
    activityId: 11,
  },
  {
    type: 'expense',
    amount: 400000,
    date: '2026-10-25',
    description: 'Aporte fondo emergencia',
    accountId: 7,
    activityId: 13,
  },

  {
    type: 'income',
    amount: 2400000,
    date: '2026-11-01',
    description: 'Salario mensual',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 235000,
    date: '2026-11-04',
    description: 'Mercado mensual',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 62000,
    date: '2026-11-09',
    description: 'Gasolina',
    accountId: 6,
    activityId: 9,
  },
  {
    type: 'expense',
    amount: 100000,
    date: '2026-11-10',
    description: 'Internet y servicios',
    accountId: 5,
    activityId: 12,
  },
  {
    type: 'expense',
    amount: 180000,
    date: '2026-11-15',
    description: 'Arreglo de la casa',
    accountId: 6,
    activityId: 12,
  },
  {
    type: 'expense',
    amount: 500000,
    date: '2026-11-22',
    description: 'Ahorro viaje Japón',
    accountId: 7,
    activityId: 14,
  },
  {
    type: 'expense',
    amount: 400000,
    date: '2026-11-26',
    description: 'Aporte fondo emergencia',
    accountId: 7,
    activityId: 13,
  },

  {
    type: 'income',
    amount: 2400000,
    date: '2026-12-01',
    description: 'Salario mensual',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 280000,
    date: '2026-12-04',
    description: 'Mercado mensual',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 65000,
    date: '2026-12-09',
    description: 'Gasolina',
    accountId: 6,
    activityId: 9,
  },
  {
    type: 'expense',
    amount: 100000,
    date: '2026-12-10',
    description: 'Internet y servicios',
    accountId: 5,
    activityId: 12,
  },
  {
    type: 'income',
    amount: 1200000,
    date: '2026-12-15',
    description: 'Prima de diciembre',
    accountId: 5,
    activityId: 8,
  },
  {
    type: 'expense',
    amount: 210000,
    date: '2026-12-19',
    description: 'Regalos de Navidad',
    accountId: 8,
    activityId: 10,
  },
  {
    type: 'expense',
    amount: 700000,
    date: '2026-12-23',
    description: 'Ahorro viaje Japón',
    accountId: 7,
    activityId: 14,
  },
  {
    type: 'expense',
    amount: 400000,
    date: '2026-12-28',
    description: 'Aporte fondo emergencia',
    accountId: 7,
    activityId: 13,
  },
];

// Exports
export class SeedDemoDataUntilDecember1790716122983 implements MigrationInterface {
  name = 'SeedDemoDataUntilDecember1790716122983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const transaction of TRANSACTIONS) {
      await queryRunner.query(
        'INSERT INTO "transaction" ("type", "amount", "date", "description", "accountId", "activityId") VALUES (?, ?, ?, ?, ?, ?)',
        [
          transaction.type,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.accountId,
          transaction.activityId,
        ],
      );
    }
  }

  // Deletes exactly the rows up() inserted, not the ones users created later.
  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const transaction of TRANSACTIONS) {
      await queryRunner.query(
        'DELETE FROM "transaction" WHERE "type" = ? AND "amount" = ? AND "date" = ? AND "description" = ? AND "accountId" = ? AND "activityId" = ?',
        [
          transaction.type,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.accountId,
          transaction.activityId,
        ],
      );
    }
  }
}
