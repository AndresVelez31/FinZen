// Internal imports
import type { LoginDTO } from '@/dtos/LoginDTO.js';
import type { LoginResponseInterface } from '@/interfaces/LoginResponseInterface.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { BaseService } from '@/services/BaseService.js';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
export class AuthService extends BaseService {
  private static readonly PATH = '/auth/token';
  private static readonly PROFILE_PATH = '/me';
  private static readonly REVOKE_PATH = '/auth/token/revoke';

  // API calls

  // Gets the tokens, then the signed-in user with that token.
  public static async login(loginDTO: LoginDTO): Promise<UserInterface> {
    const loginResponse: LoginResponseInterface = await this.httpPost(this.PATH, {
      email: loginDTO.email.trim().toLowerCase(),
      password: loginDTO.password,
    });

    const authStore = useAuthStore();
    authStore.accessToken = loginResponse.accessToken;
    authStore.refreshToken = loginResponse.refreshToken;
    const currentUser: UserInterface = await this.httpGet(this.PROFILE_PATH);
    authStore.currentUser = currentUser;

    return currentUser;
  }

  // Session

  // The local session ends first, so the user is signed out no matter what; then the
  // refresh token is revoked. If the revoke fails, the caller decides what to do.
  public static async logout(): Promise<void> {
    const refreshToken = useAuthStore().refreshToken;
    this.clearSession();

    if (refreshToken) {
      await this.httpPost(this.REVOKE_PATH, { refreshToken });
    }
  }

  public static getCurrentUser(): UserInterface | null {
    return useAuthStore().currentUser;
  }

  public static isAuthenticated(): boolean {
    const authStore = useAuthStore();
    return authStore.accessToken !== null && authStore.currentUser !== null;
  }

  public static isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }
}
