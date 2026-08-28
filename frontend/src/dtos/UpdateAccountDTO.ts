import type { AccountInterface } from '../interfaces/AccountInterface';

export type UpdateAccountDTO = Partial<Omit<AccountInterface, 'id'>>;
