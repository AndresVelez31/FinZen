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

// BaseService only has protected methods, so it is exercised through a subclass.
describe('BaseService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.accessToken = 'access-1';
    authStore.currentUser = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the access token as a Bearer Authorization header', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });

    await AccountService.getAll();

    expect(get).toHaveBeenCalledWith(expect.stringContaining('/api/accounts'), {
      headers: { Authorization: 'Bearer access-1' },
    });
  });

  it('turns an API error into an Error with the API message', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(
      buildHttpError(404, 'La cuenta no existe o no está disponible.'),
    );

    await expect(AccountService.getById(99)).rejects.toThrow(
      'La cuenta no existe o no está disponible.',
    );
    expect(useAuthStore().accessToken).toBe('access-1');
  });

  it('ends the session when the API rejects the token', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(buildHttpError(401, 'Unauthorized'));

    await expect(AccountService.getAll()).rejects.toThrow('Tu sesión expiró.');
    expect(useAuthStore().accessToken).toBeNull();
  });

  it('reports a clear message when the server cannot be reached', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new AxiosError('Network Error'));

    await expect(AccountService.getAll()).rejects.toThrow(
      'No fue posible conectar con el servidor.',
    );
  });
});
