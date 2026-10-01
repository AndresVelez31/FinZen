import type { LoginDTO } from '@/dtos/LoginDTO.js';
import type { LoginResponseInterface } from '@/interfaces/LoginResponseInterface.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { BaseService } from '@/services/BaseService.js';
import { useAuthStore } from '@/stores/authstore.js';

export class AuthService extends BaseService {
  private static readonly PATH = '/auth/token';
  private static readonly PROFILE_PATH = '/me';

  // API calls

  // Gets the access token, then the signed-in user with that token.
  static async login(loginDTO: LoginDTO): Promise<UserInterface> {
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

  static logout(): void {
    this.clearSession();
  }

  // The services that still read the local stores check ownership with these
  // two methods until they move to the API (#120).
  static getCurrentUserId(): number | null {
    return useAuthStore().currentUser?.id ?? null;
  }

  static isOwner(resourceUserId: number): boolean {
    return this.getCurrentUserId() === resourceUserId;
  }

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
