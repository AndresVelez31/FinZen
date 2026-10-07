// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface.js';

// Exports
export type SignInDTO = Pick<UserInterface, 'email'> & {
  password: string;
};
