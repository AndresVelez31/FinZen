import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<ActivityInterface[]>([]);

  return { activities };
});
