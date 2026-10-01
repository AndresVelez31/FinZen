// Imports
import axios from 'axios';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
// Superclass of every service. The API URL, the Authorization header and the
// only try/catch around axios live here, so the services that extend it never
// repeat them.
export class BaseService {
  private static readonly API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

  // HTTP methods

  protected static async httpGet(path: string) {
    try {
      const { data } = await axios.get(`${BaseService.API_URL}${path}`, BaseService.getConfig());
      return data;
    } catch (error) {
      throw BaseService.toError(error);
    }
  }

  protected static async httpPost(path: string, body: object) {
    try {
      const { data } = await axios.post(
        `${BaseService.API_URL}${path}`,
        body,
        BaseService.getConfig(),
      );
      return data;
    } catch (error) {
      throw BaseService.toError(error);
    }
  }

  protected static async httpPatch(path: string, body: object) {
    try {
      const { data } = await axios.patch(
        `${BaseService.API_URL}${path}`,
        body,
        BaseService.getConfig(),
      );
      return data;
    } catch (error) {
      throw BaseService.toError(error);
    }
  }

  protected static async httpDelete(path: string): Promise<void> {
    try {
      await axios.delete(`${BaseService.API_URL}${path}`, BaseService.getConfig());
    } catch (error) {
      throw BaseService.toError(error);
    }
  }

  // Session

  protected static clearSession(): void {
    const authStore = useAuthStore();
    authStore.accessToken = null;
    authStore.currentUser = null;
  }

  // Helpers

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

    // A 401 with a token means it expired: the session ends and AppLayout
    // goes back to the login page. A wrong password at sign-in sends no token.
    if (error.response.status === 401 && useAuthStore().accessToken) {
      BaseService.clearSession();
      return new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return new Error(error.response.data?.message ?? 'Ocurrió un error inesperado.');
  }
}
