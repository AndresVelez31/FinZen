// External imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';

// Internal imports
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';

// Exports
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  // Returns the access token the SPA sends in the Authorization header.
  async signIn(loginDto: LoginDto): Promise<TokenPair> {
    const user = await this.verifyCredentials(loginDto);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    if (!user.active) {
      throw new UnauthorizedException('Tu cuenta se encuentra inactiva.');
    }

    return await this.tokenService.issue(String(user.id), {
      method: 'password',
      claims: { amr: ['pwd'] },
    });
  }

  // The user, or null when the email or the password is wrong. With no account,
  // verify() checks a dummy hash, so the response takes the same time and does
  // not reveal which emails exist.
  private async verifyCredentials({ email, password }: LoginDto): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email?.trim().toLowerCase() ?? '');
    const passwordMatches = await this.passwordHasher.verify(password ?? '', user?.password);
    return passwordMatches ? user : null;
  }
}
