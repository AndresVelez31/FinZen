import type { TokenPair } from '@nestjs/authentication';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signIn(loginDto: LoginDto): Promise<TokenPair>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<TokenPair>;
    revoke(refreshTokenDto: RefreshTokenDto): Promise<void>;
}
