// External imports
import { Landmark, PiggyBank, Smartphone, Wallet } from 'lucide-vue-next';

// Internal imports
import type { AccountTypeOptionInterface } from '@/interfaces/AccountTypeOptionInterface.js';
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';
import type { TransactionFiltersInterface } from '@/interfaces/TransactionFiltersInterface.js';

// Exports
export const MONTH_OPTIONS: FilterOptionInterface[] = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export const TRANSACTION_TYPE_OPTIONS: FilterOptionInterface[] = [
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
];

// No filter applied; copy it ({ ...EMPTY_TRANSACTION_FILTERS }) instead of editing it.
export const EMPTY_TRANSACTION_FILTERS: Readonly<TransactionFiltersInterface> = {
  activityId: '',
  accountId: '',
  type: '',
  month: '',
  from: '',
  to: '',
};

export const USER_ROLE_OPTIONS: FilterOptionInterface[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

export const ACCOUNT_TYPE_OPTIONS: AccountTypeOptionInterface[] = [
  { value: 'Corriente', label: 'Corriente', icon: Landmark },
  { value: 'Ahorros', label: 'Ahorros', icon: PiggyBank },
  { value: 'Efectivo', label: 'Efectivo', icon: Wallet },
  { value: 'Digital', label: 'Digital', icon: Smartphone },
  { value: 'Inversión', label: 'Inversión', icon: Landmark },
];

export const ACTIVITY_COLORS: string[] = [
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#ef4444',
];
