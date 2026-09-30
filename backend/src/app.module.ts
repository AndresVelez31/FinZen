// Imports
import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { AuthModule } from './auth/auth.module.js';
import { dataSourceOptions } from './database/data-source.js';
import { HomeModule } from './home/home.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { UsersModule } from './users/users.module.js';

// Exports
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      migrationsRun: true,
    }),
    // Registers the global guard: every route requires a signed-in user
    // unless it is marked with @Public().
    AuthenticationModule.forRoot({
      accessToken: {
        // At least 32 bytes. The fallback only exists for local development;
        // docker-compose always provides JWT_SECRET.
        key: process.env.JWT_SECRET ?? 'finzen-local-development-secret-change-me',
        issuer: 'finzen-api',
        audience: 'finzen-spa',
        ttl: '15m',
      },
      refreshToken: {
        ttl: '7d',
        absoluteTtl: '30d',
      },
      // The API runs as a single instance: refresh tokens stay in memory, and
      // a restart only means signing in again (see docs/decisions/BACKEND-01).
      allowInMemoryStorage: true,
    }),
    HomeModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    ActivitiesModule,
    TransactionsModule,
  ],
})
export class AppModule {}
