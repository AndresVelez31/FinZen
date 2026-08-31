import type { AccountInterface } from '../interfaces/AccountInterface.js';

export type UpdateAccountDTO = Partial<Omit<AccountInterface, 'id' | 'userId'>>;
