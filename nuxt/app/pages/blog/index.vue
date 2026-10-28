<script setup lang="ts">
// External imports
import { useHead } from '#imports';

// Internal imports
import { ARTICLES } from '~/data/articles';
import { FormattersUtil } from '~/utils/FormattersUtil';

// Actions
useHead({ title: 'Blog · FinZen' });
</script>

<template>
  <section>
    <h1 class="mb-1">Blog</h1>
    <p class="text-secondary mb-4">
      Artículos de finanzas personales (generados en el build, SSG).
    </p>

    <div class="list-group">
      <NuxtLink
        v-for="article in ARTICLES"
        :key="article.slug"
        :to="`/blog/${article.slug}`"
        class="list-group-item list-group-item-action"
      >
        <h2 class="h5 mb-1">{{ article.title }}</h2>
        <p class="mb-1">{{ article.summary }}</p>
        <small class="text-secondary">
          {{ FormattersUtil.formatDate(article.publishedAt) }} · {{ article.readingMinutes }} min de
          lectura
        </small>
      </NuxtLink>
    </div>
  </section>
</template>
