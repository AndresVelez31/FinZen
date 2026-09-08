import { createPinia } from 'pinia';
import { watch } from 'vue';
import { userSeeder } from '@/seeders/userseeder.js';
import { accountSeeder } from '@/seeders/accountseeder.js';
import { activitySeeder } from '@/seeders/activityseeder.js';
import { transactionSeeder } from '@/seeders/transactionseeder.js';

// Bumped from 'finzenState' when currentUserId moved out of the user store
// and into its own auth store — a browser with the old shape simply starts
// unauthenticated (log in again) instead of hydrating a stale/missing session.
const STORAGE_KEY = 'finzenState.v2';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      pinia.state.value = JSON.parse(savedState);
    } else {
      pinia.state.value = {
        auth: {
          currentUserId: null,
        },
        user: {
          users: userSeeder,
        },
        account: {
          accounts: accountSeeder,
        },
        activity: {
          activities: activitySeeder,
        },
        transaction: {
          transactions: transactionSeeder,
        },
      };

      // Save the initial seeded state immediately so that if the user closes
      // the browser before the async watch fires, the data is not lost.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinia.state.value));
    }

    watch(
      pinia.state,
      (state: Record<string, unknown>) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)),
      { deep: true },
    );

    return pinia;
  }
}
