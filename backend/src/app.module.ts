// External imports
import { AuthenticationModule } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
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
        // Long enough for a working session; after it the SPA asks to sign in again.
        ttl: '8h',
      },
      // One refresh token lasts 7 days. A session renews for at most 30 days after the
      // sign-in, then it asks for the password again.
      refreshToken: { ttl: '7d', absoluteTtl: '30d' },
      // The SPA renews its session with the refresh token, which the package keeps in
      // memory. Restarting the API ends the renewals, so users sign in again when their
      // access token expires. A single instance is enough for this project.
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
