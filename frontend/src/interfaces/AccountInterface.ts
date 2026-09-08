export type AccountType = 'Corriente' | 'Ahorros' | 'Efectivo' | 'Digital' | 'Inversión';

export interface AccountInterface {
  id: number;
  userId: number;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: string;
  updatedAt: string;
}
