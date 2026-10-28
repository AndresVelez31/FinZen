<script setup lang="ts">
// Internal imports
import { NAV_ITEMS } from '~/enums/constants';
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-sm bg-body border-bottom">
      <div class="container">
        <NuxtLink class="navbar-brand text-primary" to="/">FinZen</NuxtLink>
        <ul class="navbar-nav flex-row gap-3">
          <li v-for="item in NAV_ITEMS" :key="item.to" class="nav-item">
            <NuxtLink class="nav-link" active-class="active fw-semibold" :to="item.to">
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <main class="container py-4 flex-grow-1">
      <slot />
    </main>

    <footer class="border-top py-3 text-center text-secondary small">
      FinZen · Proyecto híbrido con Nuxt 4 (SSG, SSR y CSR)
    </footer>
  </div>
</template>
