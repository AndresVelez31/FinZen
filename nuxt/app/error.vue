<script setup lang="ts">
// External imports
import type { NuxtError } from '#app';
import { clearError, useHead } from '#imports';

// Props
const props = defineProps<{ error: NuxtError }>();

// Actions
useHead({ title: 'Error · FinZen' });

async function handleGoHome(): Promise<void> {
  await clearError({ redirect: '/' });
}
</script>

<template>
  <div class="container py-5 text-center">
    <h1 class="display-1 text-primary">{{ props.error.statusCode }}</h1>
    <p class="lead">{{ props.error.statusMessage || props.error.message }}</p>
    <button type="button" class="btn btn-primary" @click="handleGoHome">Volver al inicio</button>
  </div>
</template>
