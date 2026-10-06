// External imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// Internal imports
import type { UserInterface } from '@/interfaces/UserInterface.js';

// Exports
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const currentUser = ref<UserInterface | null>(null);

  return { accessToken, refreshToken, currentUser };
});
