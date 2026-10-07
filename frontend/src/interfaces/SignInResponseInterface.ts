// Exports
// What POST /auth/token, POST /auth/sign-up and POST /auth/token/refresh return: the token
// for the Authorization header, the single-use token that renews it, and the seconds the
// access token lasts.
export interface SignInResponseInterface {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
