// Exports
// What POST /auth/token and POST /auth/token/refresh return: the token for the
// Authorization header, the single-use token that renews it, and the seconds
// the access token lasts.
export interface LoginResponseInterface {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
