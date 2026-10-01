import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790716122981 implements MigrationInterface {
  name = 'InitialSchema1790716122981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "type" varchar NOT NULL, "targetAmount" decimal(14,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "amount" decimal(14,2) NOT NULL, "date" date NOT NULL, "description" varchar NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "accountId" integer NOT NULL, "activityId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "balance" decimal(14,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('user'), "email" varchar NOT NULL, "password" varchar NOT NULL, "active" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_activity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "type" varchar NOT NULL, "targetAmount" decimal(14,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_activity"("id", "name", "color", "type", "targetAmount", "createdAt", "updatedAt", "userId") SELECT "id", "name", "color", "type", "targetAmount", "createdAt", "updatedAt", "userId" FROM "activity"`,
    );
    await queryRunner.query(`DROP TABLE "activity"`);
    await queryRunner.query(`ALTER TABLE "temporary_activity" RENAME TO "activity"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_transaction" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "amount" decimal(14,2) NOT NULL, "date" date NOT NULL, "description" varchar NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "accountId" integer NOT NULL, "activityId" integer NOT NULL, CONSTRAINT "FK_3d6e89b14baa44a71870450d14d" FOREIGN KEY ("accountId") REFERENCES "account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_f6830fcb909253d4b1333bb15fc" FOREIGN KEY ("activityId") REFERENCES "activity" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_transaction"("id", "type", "amount", "date", "description", "updatedAt", "accountId", "activityId") SELECT "id", "type", "amount", "date", "description", "updatedAt", "accountId", "activityId" FROM "transaction"`,
    );
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`ALTER TABLE "temporary_transaction" RENAME TO "transaction"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "balance" decimal(14,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_account"("id", "name", "type", "balance", "createdAt", "updatedAt", "userId") SELECT "id", "name", "type", "balance", "createdAt", "updatedAt", "userId" FROM "account"`,
    );
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`ALTER TABLE "temporary_account" RENAME TO "account"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" RENAME TO "temporary_account"`);
    await queryRunner.query(
      `CREATE TABLE "account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "balance" decimal(14,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "account"("id", "name", "type", "balance", "createdAt", "updatedAt", "userId") SELECT "id", "name", "type", "balance", "createdAt", "updatedAt", "userId" FROM "temporary_account"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_account"`);
    await queryRunner.query(`ALTER TABLE "transaction" RENAME TO "temporary_transaction"`);
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "amount" decimal(14,2) NOT NULL, "date" date NOT NULL, "description" varchar NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "accountId" integer NOT NULL, "activityId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "transaction"("id", "type", "amount", "date", "description", "updatedAt", "accountId", "activityId") SELECT "id", "type", "amount", "date", "description", "updatedAt", "accountId", "activityId" FROM "temporary_transaction"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_transaction"`);
    await queryRunner.query(`ALTER TABLE "activity" RENAME TO "temporary_activity"`);
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "type" varchar NOT NULL, "targetAmount" decimal(14,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "activity"("id", "name", "color", "type", "targetAmount", "createdAt", "updatedAt", "userId") SELECT "id", "name", "color", "type", "targetAmount", "createdAt", "updatedAt", "userId" FROM "temporary_activity"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_activity"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "activity"`);
  }
}
