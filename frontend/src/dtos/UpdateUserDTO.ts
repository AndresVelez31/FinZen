import type { UserInterface } from '../interfaces/UserInterface.js';

export type UpdateUserDTO = Partial<Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>>;
