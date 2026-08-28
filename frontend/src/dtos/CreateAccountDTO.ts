import type { AccountInterface } from '../interfaces/AccountInterface';

export type CreateAccountDTO = Omit<AccountInterface, 'id'>;
