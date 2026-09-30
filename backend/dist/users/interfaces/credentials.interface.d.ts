import type { User } from '../entities/user.entity.js';
export interface CredentialsInterface {
    user: Omit<User, 'password'>;
    passwordHash: string;
}
