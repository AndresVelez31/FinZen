// Imports
import type { LoginDTO } from '@/dtos/LoginDTO.js';
import type { LoginResponseInterface } from '@/interfaces/LoginResponseInterface.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { BaseService } from '@/services/BaseService.js';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
export class AuthService extends BaseService {
  private static readonly PATH = '/auth/token';
  private static readonly PROFILE_PATH = '/me';

  // API calls

  // Gets the access token, then the signed-in user with that token.
  public static async login(loginDTO: LoginDTO): Promise<UserInterface> {
    const loginResponse: LoginResponseInterface = await this.httpPost(this.PATH, {
      email: loginDTO.email.trim().toLowerCase(),
      password: loginDTO.password,
    });

    const authStore = useAuthStore();
    authStore.accessToken = loginResponse.accessToken;
    const currentUser: UserInterface = await this.httpGet(this.PROFILE_PATH);
    authStore.currentUser = currentUser;

    return currentUser;
  }

  // Session

  public static logout(): void {
    this.clearSession();
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
