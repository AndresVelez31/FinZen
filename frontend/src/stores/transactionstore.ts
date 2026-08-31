import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<TransactionInterface[]>([]);

  return { transactions };
});
