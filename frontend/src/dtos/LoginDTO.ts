// Imports
import type { UserInterface } from '@/interfaces/UserInterface.js';

// Exports
export type LoginDTO = Pick<UserInterface, 'email'> & {
  password: string;
};
