import type { MigrationInterface, QueryRunner } from 'typeorm';
export declare class InitialSchema1790716122981 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
