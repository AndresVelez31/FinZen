// Imports
import type { UserInterface } from '@/interfaces/UserInterface.js';

// Exports
// Admins can only change a user's role and whether the account is active.
export type UpdateUserDTO = Partial<Pick<UserInterface, 'role' | 'active'>> & {
  id: number;
};
