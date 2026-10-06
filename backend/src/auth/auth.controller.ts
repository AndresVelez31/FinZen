// External imports
import { Public } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

// Internal imports
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

// Exports
// The token routes cannot require a token: sign-in has none yet, the renewal happens
// after the access token expired, and sign-out must work with an expired one.
@Public()
@Controller('auth/token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async signIn(@Body() loginDto: LoginDto): Promise<TokenPair> {
    return await this.authService.signIn(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenPair> {
    return await this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('revoke')
  async revoke(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.revoke(refreshTokenDto.refreshToken);
  }
}
