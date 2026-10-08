// External imports
import type { MigrationInterface, QueryRunner } from 'typeorm';

// Exports
// Since this change every new user starts with a copy of the administrators' activities (the
// template, see ActivitiesService.copyTemplateToUser()). Users who signed up before it have no
// activities, so this migration gives each of them that copy. Users who already have activities,
// like the demo user, keep theirs.
export class CopyActivityTemplate1790716122984 implements MigrationInterface {
  name = 'CopyActivityTemplate1790716122984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = (await queryRunner.query(
      'SELECT "user"."id" FROM "user" WHERE "user"."role" <> ? AND NOT EXISTS (SELECT 1 FROM "activity" WHERE "activity"."userId" = "user"."id")',
      ['admin'],
    )) as { id: number }[];

    for (const user of users) {
      await queryRunner.query(
        'INSERT INTO "activity" ("name", "color", "type", "targetAmount", "userId") SELECT "activity"."name", "activity"."color", "activity"."type", "activity"."targetAmount", ? FROM "activity" INNER JOIN "user" ON "user"."id" = "activity"."userId" WHERE "user"."role" = ? ORDER BY "activity"."id"',
        [user.id, 'admin'],
      );
    }
  }

  // Removes the copies that are still untouched and unused: same fields as a template activity
  // and no transactions. Copies a user edited or already used are kept, so no data is lost.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "activity" WHERE "activity"."userId" IN (SELECT "id" FROM "user" WHERE "role" <> ?) AND NOT EXISTS (SELECT 1 FROM "transaction" WHERE "transaction"."activityId" = "activity"."id") AND EXISTS (SELECT 1 FROM "activity" AS "template" INNER JOIN "user" AS "owner" ON "owner"."id" = "template"."userId" WHERE "owner"."role" = ? AND "template"."name" = "activity"."name" AND "template"."color" = "activity"."color" AND "template"."type" = "activity"."type" AND "template"."targetAmount" = "activity"."targetAmount")',
      ['admin', 'admin'],
    );
  }
}
