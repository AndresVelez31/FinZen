// Internal imports
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';

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

export const USER_ROLE_OPTIONS: FilterOptionInterface[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
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
