import { createPinia } from 'pinia';
import { watch } from 'vue';

// TODO (Issues 5-7): import seeders and stores here

const STORAGE_KEY = 'finzenState';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      pinia.state.value = JSON.parse(saved);
    } else {
      // TODO (Issues 5-7): Load seeders after pinia is ready
      // (done inside app.use callback or via nextTick)
    }

    watch(
      pinia.state,
      (state: Record<string, unknown>) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)),
      { deep: true },
    );

    return pinia;
  }
}

