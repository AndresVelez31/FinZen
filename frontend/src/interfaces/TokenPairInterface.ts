// Exports
// What POST /auth/token and /auth/token/refresh return.
export interface TokenPairInterface {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
