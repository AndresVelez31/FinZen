import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private readonly usersService;
    private readonly passwordHasher;
    private readonly tokenService;
    constructor(usersService: UsersService, passwordHasher: PasswordHasher, tokenService: TokenService);
    signIn(loginDto: LoginDto): Promise<TokenPair>;
    refresh(refreshToken: string): Promise<TokenPair>;
    revoke(refreshToken: string): Promise<void>;
    private verifyCredentials;
}
