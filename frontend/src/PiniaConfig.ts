import { createPinia } from 'pinia';
import { watch } from 'vue';
import { userSeeder } from '@/seeders/userseeder.js';
import { accountSeeder } from '@/seeders/accountseeder.js';
import { activitySeeder } from '@/seeders/activityseeder.js';
import { transactionSeeder } from '@/seeders/transactionseeder.js';

// Bumped from 'finzenState.v2' when the session started keeping the access
// token and the signed-in user returned by the API instead of a user id.
const STORAGE_KEY = 'finzenState.v3';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      pinia.state.value = JSON.parse(savedState);
    } else {
      pinia.state.value = {
        auth: {
          accessToken: null,
          currentUser: null,
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
