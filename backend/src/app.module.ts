import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module.js';
import { AuthModule } from './auth/auth.module.js';
import { dataSourceOptions } from './database/data-source.js';
import { HomeModule } from './home/home.module.js';
import { UsersModule } from './users/users.module.js';

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
      // issue() also starts a refresh token, which the package keeps in memory
      // (the SPA does not use it). A single instance is enough for this project.
      allowInMemoryStorage: true,
    }),
    HomeModule,
    AuthModule,
    UsersModule,
    AccountsModule,
  ],
})
export class AppModule {}
