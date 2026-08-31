import type { UserInterface } from '@/interfaces/UserInterface';

export const userSeeder: UserInterface[] = [
  {
    id: '1',
    name: 'Admin Demo',
    email: 'admin@finzen.app',
    password: 'admin123',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Usuario Demo',
    email: 'user@finzen.app',
    password: 'user123',
    role: 'user',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
