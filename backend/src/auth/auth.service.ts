// External imports
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';

// Internal imports
import { ActivitiesService } from '../activities/activities.service.js';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

// Exports
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
  ) {}

  // Like the sign-up of the NestJS authentication guide, but the SPA is a token
  // client, so it receives the same token pair as the sign-in instead of a session
  // cookie. The user and their copy of the activity template are saved in one transaction.
  async signUp(signUpDto: SignUpDto): Promise<TokenPair> {
    const email = this.normalizeEmail(signUpDto.email);
    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await this.passwordHasher.hash(signUpDto.password);
    const user = await this.dataSource.transaction(async (manager) => {
      const createdUser = await this.usersService.create(
        signUpDto.name.trim(),
        email,
        passwordHash,
        manager,
      );
      await this.activitiesService.copyTemplateToUser(createdUser.id, manager);
      return createdUser;
    });

    return await this.issueTokens(user.id);
  }

  // Returns the access token the SPA sends in the Authorization header.
  async signIn(signInDto: SignInDto): Promise<TokenPair> {
    const user = await this.verifyCredentials(signInDto);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    if (!user.active) {
      throw new UnauthorizedException('Tu cuenta se encuentra inactiva.');
    }

    return await this.issueTokens(user.id);
  }

  // Exchanges a refresh token for a new pair. The package throws when the token is
  // invalid, expired or reused (a reused token also revokes its whole session).
  async refresh(refreshToken: string): Promise<TokenPair> {
    return await this.tokenService.refresh(refreshToken);
  }

  // Signs the client out by revoking its refresh token family. The result is ignored on purpose: an
  // unknown token is not revealed to the caller (RFC 7009).
  async signOut(refreshToken: string): Promise<void> {
    await this.tokenService.revoke(refreshToken);
  }

  private async issueTokens(userId: number): Promise<TokenPair> {
    return await this.tokenService.issue(String(userId), {
      method: 'password',
      claims: { amr: ['pwd'] },
    });
  }

  // Trimmed, lowercased and normalized to NFC, so the same e-mail typed in
  // different ways is stored (and looked up) once.
  private normalizeEmail(email?: string): string {
    return (email ?? '').trim().toLowerCase().normalize('NFC');
  }

  // The user, or null when the email or the password is wrong. With no account,
  // verify() checks a dummy hash, so the response takes the same time and does
  // not reveal which emails exist.
  private async verifyCredentials({ email, password }: SignInDto): Promise<User | null> {
    const user = await this.usersService.findCredentialsByEmail(this.normalizeEmail(email));
    const passwordMatches = await this.passwordHasher.verify(password ?? '', user?.password);
    return passwordMatches ? user : null;
  }
}
