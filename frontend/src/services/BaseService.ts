// External imports
import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Internal imports
import type { LoginResponseInterface } from '@/interfaces/LoginResponseInterface.js';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
// Superclass of every service. The API URL, the Authorization header, the renewal
// of an expired access token (once, with the refresh token) and the only try/catch
// around axios live here, so the services that extend it never repeat them.
export class BaseService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
  private static readonly REFRESH_PATH = '/auth/token/refresh';

  // One renewal shared by the requests that fail at the same time: a refresh token
  // is single use, so presenting it twice would revoke the whole session.
  private static renewal: Promise<boolean> | null = null;

  // HTTP methods

  protected static async httpGet(path: string) {
    return await BaseService.send(
      async () => await axios.get(`${BaseService.API_URL}${path}`, BaseService.getConfig()),
    );
  }

  protected static async httpPost(path: string, body: object) {
    return await BaseService.send(
      async () => await axios.post(`${BaseService.API_URL}${path}`, body, BaseService.getConfig()),
    );
  }

  protected static async httpPatch(path: string, body: object) {
    return await BaseService.send(
      async () => await axios.patch(`${BaseService.API_URL}${path}`, body, BaseService.getConfig()),
    );
  }

  protected static async httpDelete(path: string): Promise<void> {
    await BaseService.send(
      async () => await axios.delete(`${BaseService.API_URL}${path}`, BaseService.getConfig()),
    );
  }

  // Session

  protected static clearSession(): void {
    const authStore = useAuthStore();
    authStore.accessToken = null;
    authStore.refreshToken = null;
    authStore.currentUser = null;
  }

  // Helpers

  // Runs the request. When the access token expired, it renews the tokens and
  // retries once; the closure reads the token again, so the retry uses the new one.
  private static async send(request: () => Promise<AxiosResponse>) {
    try {
      return (await request()).data;
    } catch (error) {
      if (BaseService.isExpiredSession(error) && (await BaseService.renewTokens())) {
        try {
          return (await request()).data;
        } catch (retryError) {
          throw BaseService.toError(retryError);
        }
      }
      throw BaseService.toError(error);
    }
  }

  // A 401 while the session holds both tokens: the access token may have expired.
  private static isExpiredSession(error: unknown): boolean {
    const authStore = useAuthStore();
    return (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      authStore.accessToken !== null &&
      authStore.refreshToken !== null
    );
  }

  // Resolves true when the store holds a new pair of tokens.
  private static async renewTokens(): Promise<boolean> {
    if (BaseService.renewal === null) {
      BaseService.renewal = BaseService.requestNewTokens().finally(() => {
        BaseService.renewal = null;
      });
    }
    return await BaseService.renewal;
  }

  // Exchanges the refresh token for a new pair. On any failure it resolves false and
  // leaves the tokens in the store, so the original 401 ends the session in toError.
  private static async requestNewTokens(): Promise<boolean> {
    const authStore = useAuthStore();
    try {
      const { data } = await axios.post(`${BaseService.API_URL}${BaseService.REFRESH_PATH}`, {
        refreshToken: authStore.refreshToken,
      });
      const tokens: LoginResponseInterface = data;
      authStore.accessToken = tokens.accessToken;
      authStore.refreshToken = tokens.refreshToken;
      return true;
    } catch {
      return false;
    }
  }

  // Sends the access token, when there is one, in the Authorization header.
  private static getConfig() {
    const accessToken = useAuthStore().accessToken;
    return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
  }

  // Converts any failure into an Error whose message a view can show as-is
  // (the API already answers with user-facing messages in Spanish).
  private static toError(error: unknown): Error {
    if (!axios.isAxiosError(error) || !error.response) {
      return new Error('No fue posible conectar con el servidor.');
    }

    // A 401 with a token means it expired and could not be renewed: the session
    // ends and AppLayout goes back to the login page. A wrong password at sign-in
    // sends no token.
    if (error.response.status === 401 && useAuthStore().accessToken) {
      BaseService.clearSession();
      return new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return new Error(error.response.data?.message ?? 'Ocurrió un error inesperado.');
  }
}
