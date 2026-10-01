import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, JwtBearerProvider } from '@nestjs/authentication';
import type { JwtClaims } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

// Credential provider for `Authorization: Bearer <access token>`. The package
// checks the signature, expiry, issuer and audience, then calls validate().
@Injectable()
export class JwtAuthProvider extends JwtBearerProvider<User> {
  constructor(
    private readonly usersService: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: 'finzen' });
    registry.registerProvider(this);
  }

  // Runs on every request, so a user that was deactivated loses access
  // immediately instead of when the token expires.
  protected async validate({ sub }: JwtClaims): Promise<User | null> {
    return await this.usersService.findActive(Number(sub));
  }
}
