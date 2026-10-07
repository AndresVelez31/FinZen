// External imports
import { Public } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

// Internal imports
import { AuthService } from './auth.service.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

// Exports
// The auth routes cannot require a token: sign-up and sign-in have none yet, the
// renewal happens after the access token expired, and sign-out must work with an
// expired one.
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<TokenPair> {
    return await this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('token')
  async signIn(@Body() signInDto: SignInDto): Promise<TokenPair> {
    return await this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('token/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenPair> {
    return await this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('token/revoke')
  async signOut(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.signOut(refreshTokenDto.refreshToken);
  }
}
