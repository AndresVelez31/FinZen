// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface.js';

// Exports
export type SignUpDTO = Pick<UserInterface, 'name' | 'email'> & {
  password: string;
};
