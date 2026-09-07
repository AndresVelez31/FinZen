<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  icon: Component;
  title: string;
  text?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="empty">
    <div class="empty-icon"><component :is="icon" :size="28" /></div>
    <h4>{{ title }}</h4>
    <p v-if="text" class="muted">{{ text }}</p>
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 48px 20px;
}
.empty-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: var(--surface-2);
  color: var(--text-soft);
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}
.empty h4 {
  font-size: 1rem;
  margin-bottom: 4px;
}
.empty p {
  font-size: 0.88rem;
}
</style>
