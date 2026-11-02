// Internal imports
import type { AccountInterface } from '~/interfaces/AccountInterface';

// Exports
// There is no BaseService here: Nuxt's global `$fetch` already resolves the base URL (during SSR it
// calls the route handler directly, without an HTTP request) and throws on error statuses. It is
// not imported from `ofetch` because that plain version does not know about the server routes.
export class AccountService {
  private static readonly PATH = '/api/accounts';

  public static async getAll(): Promise<AccountInterface[]> {
    return await $fetch<AccountInterface[]>(this.PATH);
  }

  public static async getById(id: number): Promise<AccountInterface> {
    return await $fetch<AccountInterface>(`${this.PATH}/${id}`);
  }
}
