import { createPinia } from 'pinia';
import { watch } from 'vue';

// Only the session (auth) and the theme are kept in the browser; every
// domain record comes from the API. The key was bumped from 'finzenState.v3'
// when the seeders and the entity stores were removed.
const STORAGE_KEY = 'finzenState.v4';

export default class PiniaConfig {
  public static init() {
    const pinia = createPinia();

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      pinia.state.value = JSON.parse(savedState);
    }

    watch(
      pinia.state,
      (state: Record<string, unknown>) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)),
      { deep: true },
    );

    return pinia;
  }
}
