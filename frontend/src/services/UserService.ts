import type { UserInterface } from '@/interfaces/UserInterface.js';
import { useUserStore } from '@/stores/userstore.js';

export class UserService {
  static getAll(): UserInterface[] {
    return useUserStore().users;
  }

  static getById(id: number): UserInterface | undefined {
    return useUserStore().users.find((user) => user.id === id);
  }

  static updateRole(id: number, role: string): void {
    const user = UserService.getById(id);
    if (!user) {
      return;
    }
    user.role = role;
    user.updatedAt = new Date().toISOString();
  }

  static toggleActive(id: number): void {
    const user = UserService.getById(id);

    if (!user) {
      return;
    }

    user.active = !user.active;
    user.updatedAt = new Date().toISOString();
  }
}
