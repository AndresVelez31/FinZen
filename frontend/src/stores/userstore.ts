import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserInterface } from '@/interfaces/UserInterface.js';

export const useUserStore = defineStore('user', () => {
  const users = ref<UserInterface[]>([]);
  const currentUserId = ref<number | null>(null);

  return { users, currentUserId };
});
