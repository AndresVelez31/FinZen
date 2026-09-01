<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import { useThemeStore } from '@/stores/themestore.js';

const route = useRoute();
const isBlank = computed(() => route.meta.layout === 'blank');

const themeStore = useThemeStore();
watchEffect(() => {
  document.documentElement.classList.toggle('dark', themeStore.theme === 'dark');
});
</script>

<template>
  <RouterView v-if="isBlank" v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>

  <AppLayout v-else />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
