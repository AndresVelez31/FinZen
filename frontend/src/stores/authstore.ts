import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserInterface } from '@/interfaces/UserInterface.js';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const currentUser = ref<UserInterface | null>(null);

  return { accessToken, currentUser };
});
