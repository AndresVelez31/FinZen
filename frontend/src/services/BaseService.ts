// Imports
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { TokenPairInterface } from '@/interfaces/TokenPairInterface.js';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
// Superclass of every service. The HTTP calls, the Authorization header, the
// renewal of an expired access token and the error handling live only here,
// so the services that extend it never repeat a try/catch around axios.
export abstract class BaseService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
  private static readonly REFRESH_PATH = '/auth/token/refresh';

  // HTTP methods

  protected static async httpGet<T>(path: string): Promise<T> {
    return await BaseService.request<T>({ method: 'get', url: path });
  }

  protected static async httpPost<T>(path: string, body: unknown): Promise<T> {
    return await BaseService.request<T>({ method: 'post', url: path, data: body });
  }

  protected static async httpPatch<T>(path: string, body: unknown): Promise<T> {
    return await BaseService.request<T>({ method: 'patch', url: path, data: body });
  }

  protected static async httpDelete(path: string): Promise<void> {
    await BaseService.request<void>({ method: 'delete', url: path });
  }

  // Session

  protected static clearSession(): void {
    const authStore = useAuthStore();
    authStore.accessToken = null;
    authStore.refreshToken = null;
    authStore.currentUser = null;
  }

  // Helpers

  private static async request<T>(config: AxiosRequestConfig, canRefresh = true): Promise<T> {
    try {
      const { data } = await axios.request<T>({
        ...config,
        baseURL: BaseService.API_URL,
        headers: BaseService.buildHeaders(),
      });
      return data;
    } catch (error) {
      if (!BaseService.isRejectedToken(error)) {
        throw BaseService.toError(error);
      }

      // The access token lives 15 minutes: when the API rejects it, renew it
      // once with the refresh token and repeat the same request. If it cannot
      // be renewed, the session is over and AppLayout goes back to the login.
      if (canRefresh && (await BaseService.refreshTokens())) {
        return await BaseService.request<T>(config, false);
      }
      BaseService.clearSession();
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.', { cause: error });
    }
  }

  private static async refreshTokens(): Promise<boolean> {
    const authStore = useAuthStore();
    if (!authStore.refreshToken) {
      return false;
    }

    try {
      const { data } = await axios.post<TokenPairInterface>(
        `${BaseService.API_URL}${BaseService.REFRESH_PATH}`,
        { refreshToken: authStore.refreshToken },
      );
      authStore.accessToken = data.accessToken;
      authStore.refreshToken = data.refreshToken;
      return true;
    } catch {
      // The refresh token expired or was revoked.
      return false;
    }
  }

  private static buildHeaders(): Record<string, string> {
    const accessToken = useAuthStore().accessToken;
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  // A 401 on a request that carried a token (a wrong password at sign-in
  // carries none, so it is not a rejected token).
  private static isRejectedToken(error: unknown): boolean {
    return (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      useAuthStore().accessToken !== null
    );
  }

  // Converts any failure into an Error whose message a view can show as-is
  // (the API already answers with user-facing messages in Spanish).
  private static toError(error: unknown): Error {
    if (!axios.isAxiosError<{ message?: string }>(error)) {
      return new Error('Ocurrió un error inesperado.');
    }

    if (!error.response) {
      return new Error('No fue posible conectar con el servidor.');
    }

    return new Error(error.response.data?.message ?? 'Ocurrió un error inesperado.');
  }
}
