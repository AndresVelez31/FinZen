import type { UserInterface } from '@/interfaces/UserInterface.js';

export const userSeeder: UserInterface[] = [
  {
    id: 1,
    name: 'Admin Demo',
    email: 'admin@finzen.app',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Usuario Demo',
    email: 'user@finzen.app',
    password: 'user123',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
