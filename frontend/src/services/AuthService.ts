import type { UserInterface } from '@/interfaces/UserInterface.js';
import { useUserStore } from '@/stores/userstore.js';
import { useAuthStore } from '@/stores/authstore.js';

export class AuthService {
  static login(
    email: string,
    password: string,
  ): { ok: true; user: UserInterface } | { ok: false; error: string } {
    const cleanEmail = email.trim().toLowerCase();
    const user = useUserStore().users.find(
      (existingUser) => existingUser.email.toLowerCase() === cleanEmail,
    );

    if (!user || user.password !== password) {
      return { ok: false, error: 'Credenciales inválidas.' };
    }

    if (!user.active) {
      return { ok: false, error: 'Tu cuenta se encuentra inactiva.' };
    }

    useAuthStore().currentUserId = user.id;
    return { ok: true, user };
  }

  static logout(): void {
    useAuthStore().currentUserId = null;
  }

  static getCurrentUserId(): number | null {
    return useAuthStore().currentUserId;
  }

  static getCurrentUser(): UserInterface | undefined {
    const currentUserId = AuthService.getCurrentUserId();

    if (currentUserId === null) {
      return undefined;
    }

    return useUserStore().users.find((user) => user.id === currentUserId);
  }

  static isOwner(resourceUserId: number): boolean {
    const currentUserId = AuthService.getCurrentUserId();
    return currentUserId !== null && resourceUserId === currentUserId;
  }

  static isAuthenticated(): boolean {
    return AuthService.getCurrentUser() !== undefined;
  }

  static isAdmin(): boolean {
    return AuthService.getCurrentUser()?.role === 'admin';
  }
}
