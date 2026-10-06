// External imports
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';

// Internal imports
import type { User } from './entities/user.entity.js';

// Exports
// The signed-in user, as JwtAuthProvider loaded it (without the password).
@Controller('me')
export class MeController {
  @Get()
  me(@CurrentUser() user: User): User {
    return user;
  }
}
