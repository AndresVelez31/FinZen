// External imports
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

// Internal imports
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthProvider } from './jwt-auth.provider.js';
import { RolesGuard } from './roles.guard.js';

// Exports
// AuthenticationModule (app.module.ts) registers the global guard that makes
// every route require a signed-in user; this module adds the credential
// provider, the token routes and the role check.
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthProvider, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AuthModule {}
