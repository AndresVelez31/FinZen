// Internal imports
import type { SignInDTO } from '@/dtos/SignInDTO.js';
import type { SignUpDTO } from '@/dtos/SignUpDTO.js';
import type { SignInResponseInterface } from '@/interfaces/SignInResponseInterface.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { BaseService } from '@/services/BaseService.js';
import { useAuthStore } from '@/stores/authstore.js';

// Exports
export class AuthService extends BaseService {
  private static readonly PROFILE_PATH = '/me';
  private static readonly REVOKE_PATH = '/auth/token/revoke';
  private static readonly SIGN_IN_PATH = '/auth/token';
  private static readonly SIGN_UP_PATH = '/auth/sign-up';

  // API calls

  // Gets the tokens, then the signed-in user with that token.
  public static async signIn(signInDTO: SignInDTO): Promise<UserInterface> {
    const signInResponse: SignInResponseInterface = await this.httpPost(this.SIGN_IN_PATH, {
      email: signInDTO.email.trim().toLowerCase(),
      password: signInDTO.password,
    });

    return await this.startSession(signInResponse);
  }

  // Creates the account; the API answers with the same tokens as the sign-in, so the
  // new user is signed in right away.
  public static async signUp(signUpDTO: SignUpDTO): Promise<UserInterface> {
    const signInResponse: SignInResponseInterface = await this.httpPost(this.SIGN_UP_PATH, {
      name: signUpDTO.name.trim(),
      email: signUpDTO.email.trim().toLowerCase(),
      password: signUpDTO.password,
    });

    return await this.startSession(signInResponse);
  }

  // Session

  // The local session ends first, so the user is signed out no matter what; then the
  // refresh token is revoked. If the revoke fails, the caller decides what to do.
  public static async signOut(): Promise<void> {
    const refreshToken = useAuthStore().refreshToken;
    this.clearSession();

    if (refreshToken) {
      await this.httpPost(this.REVOKE_PATH, { refreshToken });
    }
  }

  // Forgets the tokens and the user. Used by signOut() and by AppLayoutComponent when
  // BaseService drops tokens that expired and could not be renewed.
  public static clearSession(): void {
    const authStore = useAuthStore();
    authStore.accessToken = null;
    authStore.refreshToken = null;
    authStore.currentUser = null;
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

  // Helpers

  // Stores the tokens, then loads the signed-in user with them.
  private static async startSession(
    signInResponse: SignInResponseInterface,
  ): Promise<UserInterface> {
    const authStore = useAuthStore();
    authStore.accessToken = signInResponse.accessToken;
    authStore.refreshToken = signInResponse.refreshToken;
    const currentUser: UserInterface = await this.httpGet(this.PROFILE_PATH);
    authStore.currentUser = currentUser;

    return currentUser;
  }
}
