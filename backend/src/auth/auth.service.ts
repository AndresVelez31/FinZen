// Imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';
import type { CredentialsInterface } from '../users/interfaces/credentials.interface.js';
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

  // A short-lived access token plus a single-use refresh token.
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

  // Spends the refresh token and returns a new pair; an unknown, expired or
  // reused token is answered with 401 by the package.
  async refresh(refreshToken: string): Promise<TokenPair> {
    return await this.tokenService.refresh(refreshToken ?? '');
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.tokenService.revoke(refreshToken ?? '');
  }

  // The user without the password hash, or null when the email or the
  // password is wrong. With no account, verify() checks a dummy hash, so the
  // response takes the same time and does not reveal which emails exist.
  private async verifyCredentials({
    email,
    password,
  }: LoginDto): Promise<CredentialsInterface['user'] | null> {
    const credentials = await this.usersService.findCredentials(email?.trim().toLowerCase() ?? '');
    const passwordMatches = await this.passwordHasher.verify(
      password ?? '',
      credentials?.passwordHash,
    );
    return passwordMatches && credentials ? credentials.user : null;
  }
}
