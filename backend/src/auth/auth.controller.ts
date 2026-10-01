import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import type { TokenPair } from '@nestjs/authentication';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

// The sign-in route cannot require a token, so it is public.
@Public()
@Controller('auth/token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async signIn(@Body() loginDto: LoginDto): Promise<TokenPair> {
    return await this.authService.signIn(loginDto);
  }
}
