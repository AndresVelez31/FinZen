// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface.js';

// Exports
export type RegisterDTO = Pick<UserInterface, 'name' | 'email'> & {
  password: string;
};
