<script setup lang="ts">
// External imports
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

// Internal imports
import AuthLayoutComponent from '@/components/auth/AuthLayoutComponent.vue';
import AppLayoutComponent from '@/components/layout/AppLayoutComponent.vue';
import { useThemeStore } from '@/stores/themestore.js';

// Variables
const route = useRoute();
const themeStore = useThemeStore();

// Computed
const isAuth = computed(() => route.meta.layout === 'auth');

// Watchers
watchEffect(() => {
  document.documentElement.classList.toggle('dark', themeStore.theme === 'dark');
});
</script>

<template>
  <AuthLayoutComponent v-if="isAuth" />

  <AppLayoutComponent v-else />
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
