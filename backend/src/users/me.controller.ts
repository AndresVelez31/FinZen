import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import type { User } from './entities/user.entity.js';

// The signed-in user, as JwtAuthProvider loaded it (without the password).
@Controller('me')
export class MeController {
  @Get()
  me(@CurrentUser() user: User): User {
    return user;
  }
}
