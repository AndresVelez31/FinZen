// Imports
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountService } from '@/services/AccountService.js';
import { useAuthStore } from '@/stores/authstore.js';

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

// BaseService is abstract, so it is exercised through one of its subclasses.
describe('BaseService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.accessToken = 'access-1';
    authStore.refreshToken = 'refresh-1';
    authStore.currentUser = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the access token as a Bearer Authorization header', async () => {
    const request = vi.spyOn(axios, 'request').mockResolvedValue({ data: [] });

    await AccountService.getAll();

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: '/accounts',
        headers: { Authorization: 'Bearer access-1' },
      }),
    );
  });

  it('turns an API error into an Error with the API message', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(
      buildHttpError(404, 'La cuenta no existe o no está disponible.'),
    );

    await expect(AccountService.getById(99)).rejects.toThrow(
      'La cuenta no existe o no está disponible.',
    );
    expect(useAuthStore().accessToken).toBe('access-1');
  });

  it('renews an expired access token once and repeats the request', async () => {
    const request = vi
      .spyOn(axios, 'request')
      .mockRejectedValueOnce(buildHttpError(401, 'Unauthorized'))
      .mockResolvedValueOnce({ data: [] });
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'access-2', refreshToken: 'refresh-2', expiresIn: 900 },
    });

    await AccountService.getAll();

    expect(refresh).toHaveBeenCalledWith(expect.stringContaining('/auth/token/refresh'), {
      refreshToken: 'refresh-1',
    });
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ headers: { Authorization: 'Bearer access-2' } }),
    );
    expect(useAuthStore().refreshToken).toBe('refresh-2');
  });

  it('drops the session when the token cannot be renewed', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(buildHttpError(401, 'Unauthorized'));
    vi.spyOn(axios, 'post').mockRejectedValue(buildHttpError(401, 'Refresh token expired'));

    await expect(AccountService.getAll()).rejects.toThrow('Tu sesión expiró.');
    expect(useAuthStore().accessToken).toBeNull();
    expect(useAuthStore().refreshToken).toBeNull();
  });

  it('reports a clear message when the server cannot be reached', async () => {
    vi.spyOn(axios, 'request').mockRejectedValue(new AxiosError('Network Error'));

    await expect(AccountService.getAll()).rejects.toThrow(
      'No fue posible conectar con el servidor.',
    );
  });
});
