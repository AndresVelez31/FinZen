import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';

// Shared by AppModule and the TypeORM CLI (migration:generate / migration:run).
// The schema is never synchronized automatically: every change goes through a
// migration so the database keeps a history of how it evolved.
export const dataSourceOptions: DataSourceOptions = {
  type: 'better-sqlite3',
  database: process.env.SQLITE_PATH ?? 'database.sqlite',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
