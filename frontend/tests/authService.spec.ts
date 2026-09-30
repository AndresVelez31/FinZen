// Imports
import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

const TOKENS = { accessToken: 'access-1', refreshToken: 'refresh-1', expiresIn: 900 };

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
    const request = vi
      .spyOn(axios, 'request')
      .mockImplementation(async (config: AxiosRequestConfig) =>
        config.url === '/auth/token' ? { data: TOKENS } : { data: ADMIN },
      );

    const user = await AuthService.login({ email: '  ADMIN@finzen.app ', password: 'admin123' });

    expect(request).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'post',
        url: '/auth/token',
        data: { email: 'admin@finzen.app', password: 'admin123' },
      }),
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'get',
        url: '/me',
        headers: { Authorization: 'Bearer access-1' },
      }),
    );
    expect(user).toEqual(ADMIN);
    expect(useAuthStore().refreshToken).toBe('refresh-1');
    expect(AuthService.isAuthenticated()).toBe(true);
    expect(AuthService.isAdmin()).toBe(true);
  });

  it('rejects with the API message and does not open a session', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(buildHttpError(401, 'Credenciales inválidas.'));

    await expect(
      AuthService.login({ email: 'admin@finzen.app', password: 'wrong' }),
    ).rejects.toThrow('Credenciales inválidas.');
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it('clears the session and revokes the refresh token on logout', async () => {
    const request = vi.spyOn(axios, 'request').mockResolvedValue({ data: undefined });
    const authStore = useAuthStore();
    authStore.accessToken = 'access-1';
    authStore.refreshToken = 'refresh-1';
    authStore.currentUser = { ...ADMIN, role: 'user' };

    expect(AuthService.isAuthenticated()).toBe(true);
    expect(AuthService.isAdmin()).toBe(false);

    await AuthService.logout();

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: '/auth/token/revoke',
        data: { refreshToken: 'refresh-1' },
      }),
    );
    expect(AuthService.isAuthenticated()).toBe(false);
    expect(AuthService.getCurrentUser()).toBeNull();
  });
});
