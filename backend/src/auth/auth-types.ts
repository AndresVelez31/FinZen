// Imports
import type { User } from '../users/entities/user.entity.js';

// Exports
// Tells @nestjs/authentication which type the authenticated user has, so
// @CurrentUser('id') is checked against the User entity.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
  }
}
