import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { AuthService } from '@/services/AuthService.js';
import { useUserStore } from '@/stores/userstore.js';

const buildUser = (overrides: Partial<UserInterface>): UserInterface => ({
  id: 1,
  name: 'Admin FinZen',
  role: 'admin',
  email: 'admin@finzen.app',
  password: 'admin123',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('AuthService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().users = [
      buildUser({}),
      buildUser({ id: 2, role: 'user', email: 'user@finzen.app', password: 'user123' }),
      buildUser({ id: 3, role: 'user', email: 'inactive@finzen.app', active: false }),
    ];
  });

  it('logs in with a case-insensitive, trimmed email', () => {
    const result = AuthService.login('  ADMIN@finzen.app ', 'admin123');

    expect(result.ok).toBe(true);
    expect(AuthService.getCurrentUserId()).toBe(1);
    expect(AuthService.isAuthenticated()).toBe(true);
    expect(AuthService.isAdmin()).toBe(true);
  });

  it('rejects a wrong password without opening a session', () => {
    const result = AuthService.login('admin@finzen.app', 'wrong');

    expect(result).toEqual({ ok: false, error: 'Credenciales inválidas.' });
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it('rejects inactive users', () => {
    const result = AuthService.login('inactive@finzen.app', 'admin123');

    expect(result).toEqual({ ok: false, error: 'Tu cuenta se encuentra inactiva.' });
  });

  it('checks ownership against the current session and clears it on logout', () => {
    AuthService.login('user@finzen.app', 'user123');

    expect(AuthService.isOwner(2)).toBe(true);
    expect(AuthService.isOwner(1)).toBe(false);
    expect(AuthService.isAdmin()).toBe(false);

    AuthService.logout();

    expect(AuthService.isOwner(2)).toBe(false);
  });
});
