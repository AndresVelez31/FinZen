import type { UserInterface } from '../interfaces/UserInterface';

export type UpdateUserDTO = Partial<Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>>;
