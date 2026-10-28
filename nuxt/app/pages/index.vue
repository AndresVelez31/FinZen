<script setup lang="ts">
// External imports
import { useHead } from '#imports';

// Internal imports
import { SECTION_CARDS } from '~/enums/constants';

// Actions
useHead({ title: 'Inicio · FinZen' });
</script>

<template>
  <section>
    <h1 class="mb-1">FinZen</h1>
    <p class="text-secondary mb-4">
      Mini panel de finanzas personales con renderizado híbrido: cada sección usa una estrategia
      distinta.
    </p>

    <div class="row g-3">
      <div v-for="section in SECTION_CARDS" :key="section.to" class="col-12 col-md-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge text-bg-primary align-self-start mb-2">{{
              section.renderMode
            }}</span>
            <h2 class="h5">{{ section.title }}</h2>
            <p class="text-secondary flex-grow-1">{{ section.description }}</p>
            <NuxtLink class="btn btn-outline-primary" :to="section.to"
              >Ir a {{ section.title }}</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
