// Imports
import type { LoginDTO } from '@/dtos/LoginDTO.js';
import type { TokenPairInterface } from '@/interfaces/TokenPairInterface.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { BaseService } from '@/services/BaseService.js';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
export class AuthService extends BaseService {
  private static readonly PATH = '/auth/token';
  private static readonly PROFILE_PATH = '/me';

  // API calls

  // Gets the tokens, then the signed-in user with the new access token.
  static async login(loginDTO: LoginDTO): Promise<UserInterface> {
    const tokens = await this.httpPost<TokenPairInterface>(this.PATH, {
      email: loginDTO.email.trim().toLowerCase(),
      password: loginDTO.password,
    });

    const authStore = useAuthStore();
    authStore.accessToken = tokens.accessToken;
    authStore.refreshToken = tokens.refreshToken;
    authStore.currentUser = await this.httpGet<UserInterface>(this.PROFILE_PATH);

    return authStore.currentUser;
  }

  // The local session ends first, so the user is signed out even if the API
  // cannot be reached; then the refresh token is revoked in the API.
  static async logout(): Promise<void> {
    const refreshToken = useAuthStore().refreshToken;
    this.clearSession();

    if (refreshToken) {
      await this.httpPost<void>(`${this.PATH}/revoke`, { refreshToken });
    }
  }

  // Session

  static getCurrentUser(): UserInterface | null {
    return useAuthStore().currentUser;
  }

  static isAuthenticated(): boolean {
    const authStore = useAuthStore();
    return authStore.accessToken !== null && authStore.currentUser !== null;
  }

  static isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }
}
