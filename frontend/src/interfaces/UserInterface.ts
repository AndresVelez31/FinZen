// Exports
// The API never sends the password (see SignInDTO for the credentials).
export interface UserInterface {
  id: number;
  name: string;
  role: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
