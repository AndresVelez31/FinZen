// External imports
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { AuthService } from '@/services/AuthService.js';
import { useAuthStore } from '@/stores/authstore.js';

const ADMIN: UserInterface = {
  id: 1,
  name: 'Admin FinZen',
  role: 'admin',
  email: 'admin@finzen.app',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const TOKENS = { accessToken: 'access-1', refreshToken: 'refresh-1', expiresIn: 28800 };

function buildHttpError(status: number, message: string): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(message, String(status), config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: { message },
  });
}

describe('AuthService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets the tokens with a trimmed, lower-case email and then the signed-in user', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: TOKENS });
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: ADMIN });

    const user = await AuthService.login({ email: '  ADMIN@finzen.app ', password: 'admin123' });

    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/token'),
      { email: 'admin@finzen.app', password: 'admin123' },
      {},
    );
    expect(get).toHaveBeenCalledWith(expect.stringContaining('/api/me'), {
      headers: { Authorization: 'Bearer access-1' },
    });
    expect(user).toEqual(ADMIN);
    expect(useAuthStore().refreshToken).toBe('refresh-1');
    expect(AuthService.isAuthenticated()).toBe(true);
    expect(AuthService.isAdmin()).toBe(true);
  });

  it('rejects with the API message and does not open a session', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(buildHttpError(401, 'Credenciales inválidas.'));

    await expect(
      AuthService.login({ email: 'admin@finzen.app', password: 'wrong' }),
    ).rejects.toThrow('Credenciales inválidas.');
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it('clears the session and revokes the refresh token on logout', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: '' });
    const authStore = useAuthStore();
    authStore.accessToken = 'access-1';
    authStore.refreshToken = 'refresh-1';
    authStore.currentUser = { ...ADMIN, role: 'user' };

    expect(AuthService.isAuthenticated()).toBe(true);
    expect(AuthService.isAdmin()).toBe(false);

    await AuthService.logout();

    expect(post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/token/revoke'),
      { refreshToken: 'refresh-1' },
      {},
    );
    expect(AuthService.isAuthenticated()).toBe(false);
    expect(AuthService.getCurrentUser()).toBeNull();
    expect(authStore.refreshToken).toBeNull();
  });

  it('clears the session on logout even when the revoke fails', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new AxiosError('Network Error'));
    const authStore = useAuthStore();
    authStore.accessToken = 'access-1';
    authStore.refreshToken = 'refresh-1';
    authStore.currentUser = ADMIN;

    await expect(AuthService.logout()).rejects.toThrow('No fue posible conectar con el servidor.');

    expect(authStore.accessToken).toBeNull();
    expect(authStore.refreshToken).toBeNull();
    expect(AuthService.isAuthenticated()).toBe(false);
  });
});
