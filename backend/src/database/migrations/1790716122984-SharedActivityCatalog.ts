// External imports
import type { MigrationInterface, QueryRunner } from 'typeorm';

// Activities are one catalog managed by the administrators and shared by every user. SeedDemoData
// gave the demo user its own copies (activities 8-14), so this migration moves their transactions
// to the matching administrator activity and deletes the copies. A new migration instead of
// editing SeedDemoData, so a database that already ran it is fixed on its next start.
const DEMO_USER_ACTIVITIES = [
  { id: 8, name: 'Alimentación', color: '#10B981', type: 'expense', targetAmount: 400000, to: 1 },
  { id: 9, name: 'Transporte', color: '#0EA5E9', type: 'expense', targetAmount: 150000, to: 2 },
  { id: 10, name: 'Ocio', color: '#F59E0B', type: 'expense', targetAmount: 200000, to: 4 },
  { id: 11, name: 'Salud', color: '#EC4899', type: 'expense', targetAmount: 100000, to: 3 },
  { id: 12, name: 'Hogar', color: '#6366F1', type: 'expense', targetAmount: 600000, to: 5 },
  {
    id: 13,
    name: 'Fondo emergencia',
    color: '#8B5CF6',
    type: 'savings',
    targetAmount: 6000000,
    to: 6,
  },
  { id: 14, name: 'Viaje Japón', color: '#14B8A6', type: 'savings', targetAmount: 5000000, to: 7 },
];
const DEMO_USER_ID = 2;

// Exports
export class SharedActivityCatalog1790716122984 implements MigrationInterface {
  name = 'SharedActivityCatalog1790716122984';

  // Only a copy that still belongs to a non-admin user is merged, and only when its target
  // activity still exists; otherwise the copy stays and simply joins the shared catalog.
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const activity of DEMO_USER_ACTIVITIES) {
      const [copy] = (await queryRunner.query(
        'SELECT "activity"."id" FROM "activity" INNER JOIN "user" ON "user"."id" = "activity"."userId" WHERE "activity"."id" = ? AND "user"."role" <> ?',
        [activity.id, 'admin'],
      )) as { id: number }[];
      const [target] = (await queryRunner.query('SELECT "id" FROM "activity" WHERE "id" = ?', [
        activity.to,
      ])) as { id: number }[];
      if (!copy || !target) {
        continue;
      }

      await queryRunner.query('UPDATE "transaction" SET "activityId" = ? WHERE "activityId" = ?', [
        activity.to,
        activity.id,
      ]);
      await queryRunner.query('DELETE FROM "activity" WHERE "id" = ?', [activity.id]);
    }
  }

  // Recreates the demo user's copies and gives them back the transactions of that user's accounts.
  public async down(queryRunner: QueryRunner): Promise<void> {
    const [demoUser] = (await queryRunner.query('SELECT "id" FROM "user" WHERE "id" = ?', [
      DEMO_USER_ID,
    ])) as { id: number }[];
    if (!demoUser) {
      return;
    }

    for (const activity of DEMO_USER_ACTIVITIES) {
      const [existing] = (await queryRunner.query('SELECT "id" FROM "activity" WHERE "id" = ?', [
        activity.id,
      ])) as { id: number }[];
      if (existing) {
        continue;
      }

      await queryRunner.query(
        'INSERT INTO "activity" ("id", "name", "color", "type", "targetAmount", "userId") VALUES (?, ?, ?, ?, ?, ?)',
        [
          activity.id,
          activity.name,
          activity.color,
          activity.type,
          activity.targetAmount,
          DEMO_USER_ID,
        ],
      );
      await queryRunner.query(
        'UPDATE "transaction" SET "activityId" = ? WHERE "activityId" = ? AND "accountId" IN (SELECT "id" FROM "account" WHERE "userId" = ?)',
        [activity.id, activity.to, DEMO_USER_ID],
      );
    }
  }
}
