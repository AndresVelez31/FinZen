<script setup lang="ts">
// External imports
import { definePageMeta, useHead, useRoute } from '#imports';

// Internal imports
import { ARTICLES } from '~/data/articles';
import type { ArticleInterface } from '~/interfaces/ArticleInterface';
import { ArticleUtil } from '~/utils/ArticleUtil';
import { FormattersUtil } from '~/utils/FormattersUtil';

// Variables
// An unknown slug never reaches the page: the router answers 404 before rendering it.
definePageMeta({
  validate: (route) => ArticleUtil.findBySlug(ARTICLES, String(route.params.slug)) !== undefined,
});
const route = useRoute();
const article = ArticleUtil.findBySlug(ARTICLES, String(route.params.slug)) as ArticleInterface;

// Actions
useHead({ title: `${article.title} · FinZen` });
</script>

<template>
  <article>
    <NuxtLink to="/blog" class="btn btn-link px-0">← Volver al blog</NuxtLink>
    <h1 class="mb-2">{{ article.title }}</h1>
    <p class="text-secondary mb-4">
      {{ article.author }} · {{ FormattersUtil.formatDate(article.publishedAt) }} ·
      {{ article.readingMinutes }} min de lectura
    </p>
    <p v-for="(paragraph, index) in article.paragraphs" :key="index" class="fs-5">
      {{ paragraph }}
    </p>
  </article>
</template>
