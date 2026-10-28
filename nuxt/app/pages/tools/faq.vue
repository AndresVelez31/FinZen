<script setup lang="ts">
// External imports
import { useHead } from '#imports';

// Internal imports
import { FAQS } from '~/data/faqs';

// Actions
useHead({ title: 'Preguntas frecuentes · FinZen' });
</script>

<template>
  <section>
    <NuxtLink to="/tools" class="btn btn-link px-0">← Volver a herramientas</NuxtLink>
    <h1 class="mb-4">Preguntas frecuentes</h1>

    <div id="faqAccordion" class="accordion">
      <div v-for="(faq, index) in FAQS" :key="faq.question" class="accordion-item">
        <h2 class="accordion-header">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#faq-${index}`"
            aria-expanded="false"
            :aria-controls="`faq-${index}`"
          >
            {{ faq.question }}
          </button>
        </h2>
        <div
          :id="`faq-${index}`"
          class="accordion-collapse collapse"
          data-bs-parent="#faqAccordion"
        >
          <div class="accordion-body">{{ faq.answer }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
