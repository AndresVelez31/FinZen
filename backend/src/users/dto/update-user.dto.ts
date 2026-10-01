import type { Role } from '../enums/role.enum.js';

// Admins can only change a user's role and whether the account is active.
export class UpdateUserDto {
  role?: Role;
  active?: boolean;
}
