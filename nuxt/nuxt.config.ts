// External imports
import { defineNuxtConfig } from 'nuxt/config';

// Internal imports
import { ARTICLES } from './app/data/articles';

// Exports
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'FinZen',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
          integrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
          crossorigin: 'anonymous',
        },
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
          integrity: 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz',
          crossorigin: 'anonymous',
          defer: true,
        },
      ],
    },
  },
  // Hybrid rendering: each section of the deliverable uses a different strategy.
  routeRules: {
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/accounts': { ssr: true },
    '/accounts/**': { ssr: true },
    '/tools': { ssr: false },
    '/tools/**': { ssr: false },
  },
  // The article pages are not linked from every page, so they are listed explicitly.
  nitro: {
    prerender: {
      routes: ARTICLES.map((article) => `/blog/${article.slug}`),
    },
  },
});
