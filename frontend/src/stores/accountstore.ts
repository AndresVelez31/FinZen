import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<AccountInterface[]>([]);

  return { accounts };
});
