// The API never sends the password (see LoginDTO for the credentials).
export interface UserInterface {
  id: number;
  name: string;
  role: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
