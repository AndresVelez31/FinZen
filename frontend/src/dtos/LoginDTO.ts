import type { UserInterface } from '@/interfaces/UserInterface.js';

export type LoginDTO = Pick<UserInterface, 'email'> & {
  password: string;
};
