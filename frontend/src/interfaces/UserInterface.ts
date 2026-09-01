export interface UserInterface {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
