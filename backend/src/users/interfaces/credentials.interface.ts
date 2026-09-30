// Imports
import type { User } from '../entities/user.entity.js';

// Exports
// What the sign-in reads: the user without its password, and the hash apart,
// so the hash never travels inside a User object.
export interface CredentialsInterface {
  user: Omit<User, 'password'>;
  passwordHash: string;
}
