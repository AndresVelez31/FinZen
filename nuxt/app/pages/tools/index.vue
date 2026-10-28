<script setup lang="ts">
// External imports
import { useHead } from '#imports';

// Actions
useHead({ title: 'Herramientas · FinZen' });
</script>

<template>
  <section>
    <h1 class="mb-1">Herramientas</h1>
    <p class="text-secondary mb-4">Se renderizan solo en el navegador (CSR).</p>

    <div class="row g-3">
      <div class="col-12 col-md-6">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h2 class="h5">Calculadora de ahorro</h2>
            <p class="text-secondary flex-grow-1">
              Proyecta cuánto tendrás con un aporte mensual y una tasa de interés.
            </p>
            <NuxtLink class="btn btn-outline-primary" to="/tools/savings-calculator">
              Abrir calculadora
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h2 class="h5">Preguntas frecuentes</h2>
            <p class="text-secondary flex-grow-1">Respuestas rápidas sobre cómo usar FinZen.</p>
            <NuxtLink class="btn btn-outline-primary" to="/tools/faq">Ver preguntas</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
