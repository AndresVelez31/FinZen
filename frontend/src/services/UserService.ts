import type { UserInterface } from '@/interfaces/UserInterface.js';
import { useUserStore } from '@/stores/userstore.js';

export class UserService {
  static getUsers(): UserInterface[] {
    return useUserStore().users;
  }

  static getUserById(id: string): UserInterface | undefined {
    return useUserStore().users.find((user) => user.id === id);
  }

  static updateUserRole(id: string, role: string): void {
    const user = UserService.getUserById(id);
    if (!user) {
      return;
    }
    user.role = role;
    user.updatedAt = new Date().toISOString();
  }

  static toggleUserActive(id: string): void {
    const user = UserService.getUserById(id);
    if (!user) {
      return;
    }
    user.active = !user.active;
    user.updatedAt = new Date().toISOString();
  }

  static login(
    email: string,
    password: string,
  ): { ok: true; user: UserInterface } | { ok: false; error: string } {
    const store = useUserStore();
    const cleanEmail = email.trim().toLowerCase();

    const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || user.password !== password) {
      return { ok: false, error: 'Credenciales inválidas.' };
    }
    if (!user.active) {
      return { ok: false, error: 'Cuenta inactiva.' };
    }

    store.currentUserId = user.id;
    return { ok: true, user };
  }

  static logout(): void {
    useUserStore().currentUserId = null;
  }
}
