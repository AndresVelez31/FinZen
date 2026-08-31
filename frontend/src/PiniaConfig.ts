import { createPinia } from 'pinia';
import { watch } from 'vue';
import { userSeeder } from '@/stores/userseeder';
import { accountSeeder } from '@/stores/accountseeder';
import { activitySeeder } from '@/stores/activityseeder';
import { transactionSeeder } from '@/stores/transactionseeder';

const STORAGE_KEY = 'finzenState';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      pinia.state.value = JSON.parse(savedState);
    } else {
      pinia.state.value = {
        user: {
          users: userSeeder,
          currentUserId: null,
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
