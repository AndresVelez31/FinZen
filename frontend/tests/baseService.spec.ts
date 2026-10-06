// External imports
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Internal imports
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

// BaseService only has protected methods, so it is exercised through a subclass.
describe('BaseService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.accessToken = 'access-1';
    authStore.refreshToken = null;
    authStore.currentUser = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the access token as a Bearer Authorization header', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });

    await AccountService.getAllByUserId();

    expect(get).toHaveBeenCalledWith(expect.stringContaining('/api/accounts'), {
      headers: { Authorization: 'Bearer access-1' },
    });
  });

  it('turns an API error into an Error with the API message', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(
      buildHttpError(404, 'La cuenta no existe o no está disponible.'),
    );

    await expect(AccountService.getByIdAndUserId(99)).rejects.toThrow(
      'La cuenta no existe o no está disponible.',
    );
    expect(useAuthStore().accessToken).toBe('access-1');
  });

  it('ends the session when the API rejects the token', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(buildHttpError(401, 'Unauthorized'));

    await expect(AccountService.getAllByUserId()).rejects.toThrow('Tu sesión expiró.');
    expect(useAuthStore().accessToken).toBeNull();
  });

  it('renews the tokens on a 401 and retries the request with the new access token', async () => {
    const authStore = useAuthStore();
    authStore.refreshToken = 'refresh-1';
    const get = vi
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(buildHttpError(401, 'Unauthorized'))
      .mockResolvedValueOnce({ data: [{ id: 1 }] });
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'access-2', refreshToken: 'refresh-2', expiresIn: 28800 },
    });

    const accounts = await AccountService.getAllByUserId();

    expect(post).toHaveBeenCalledWith(expect.stringContaining('/api/auth/token/refresh'), {
      refreshToken: 'refresh-1',
    });
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenLastCalledWith(expect.stringContaining('/api/accounts'), {
      headers: { Authorization: 'Bearer access-2' },
    });
    expect(accounts).toEqual([{ id: 1 }]);
    expect(authStore.accessToken).toBe('access-2');
    expect(authStore.refreshToken).toBe('refresh-2');
  });

  it('ends the session when the tokens cannot be renewed', async () => {
    const authStore = useAuthStore();
    authStore.refreshToken = 'refresh-1';
    vi.spyOn(axios, 'get').mockRejectedValue(buildHttpError(401, 'Unauthorized'));
    vi.spyOn(axios, 'post').mockRejectedValue(buildHttpError(401, 'Refresh token reused'));

    await expect(AccountService.getAllByUserId()).rejects.toThrow('Tu sesión expiró.');
    expect(authStore.accessToken).toBeNull();
    expect(authStore.refreshToken).toBeNull();
  });

  it('reports a clear message when the server cannot be reached', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new AxiosError('Network Error'));

    await expect(AccountService.getAllByUserId()).rejects.toThrow(
      'No fue posible conectar con el servidor.',
    );
  });
});
