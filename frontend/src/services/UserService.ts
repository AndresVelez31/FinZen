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

  static login(
    email: string,
    password: string,
  ): { ok: true; user: UserInterface } | { ok: false; error: string } {
    const store = useUserStore();
    const cleanEmail = email.trim().toLowerCase();

    const user = store.users.find((existingUser) => existingUser.email.toLowerCase() === cleanEmail);
    if (!user || user.password !== password) {
      return { ok: false, error: 'Credenciales inválidas.' };
    }

    if (!user.active) {
      return {
        ok: false,
        error: 'Tu cuenta se encuentra inactiva.',
      };
    }

    store.currentUserId = user.id;
    return { ok: true, user };
  }

  static logout(): void {
    useUserStore().currentUserId = null;
  }

  static getCurrent(): UserInterface | undefined {
    const store = useUserStore();

    if (store.currentUserId === null) {
      return undefined;
    }

    return store.users.find((user) => user.id === store.currentUserId);
  }

  static isAuthenticated(): boolean {
    return UserService.getCurrent() !== undefined;
  }
}
