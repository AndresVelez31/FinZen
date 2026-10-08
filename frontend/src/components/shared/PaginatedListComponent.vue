<script setup lang="ts" generic="T">
// External imports
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

// Internal imports
import { PaginationUtil } from '@/utils/PaginationUtil.js';

// Props
// Receives the whole list and hands the current page to its slot, so a view only says what to
// paginate and how to show it: v-slot="{ items: pagedAccounts }". The page controls hide
// themselves when everything fits in one page. To start again from page 1 (e.g. when a filter
// changes), the view gives the component a :key that changes with the filter.
const props = withDefaults(
  defineProps<{
    items: T[];
    pageSize: number;
    itemLabel?: string;
  }>(),
  {
    itemLabel: 'elementos',
  },
);

// Reactive variables
const currentPage = ref(1);
const root = ref<HTMLElement | null>(null);

// Computed
const pageCount = computed(() => PaginationUtil.countPages(props.items.length, props.pageSize));
const pageItems = computed(() =>
  PaginationUtil.extractPage(props.items, currentPage.value, props.pageSize),
);
const pages = computed(() => PaginationUtil.buildPageList(currentPage.value, pageCount.value));
const firstItem = computed(() => (currentPage.value - 1) * props.pageSize + 1);
const lastItem = computed(() => Math.min(currentPage.value * props.pageSize, props.items.length));

// Actions
// Brings the top of the list back into view, below the sticky top bar.
function goTo(page: number): void {
  if (page < 1 || page > pageCount.value || page === currentPage.value) {
    return;
  }
  currentPage.value = page;

  const top = root.value?.getBoundingClientRect().top ?? 0;
  if (top < 80) {
    window.scrollBy({ top: top - 84, behavior: 'smooth' });
  }
}

// Watchers
// After a delete the last page may no longer exist.
watch(pageCount, (count) => {
  if (currentPage.value > count) {
    currentPage.value = count;
  }
});
</script>

<template>
  <div ref="root">
    <slot :items="pageItems" />

    <nav v-if="props.items.length > props.pageSize" class="pagination" aria-label="Paginación">
      <p class="range num">
        <strong>{{ firstItem }}–{{ lastItem }}</strong> de {{ props.items.length }}
        {{ props.itemLabel }}
      </p>

      <div class="controls">
        <button
          type="button"
          class="page-btn step"
          :disabled="currentPage === 1"
          aria-label="Página anterior"
          @click="goTo(currentPage - 1)"
        >
          <ChevronLeft :size="17" />
          <span class="step-label">Anterior</span>
        </button>

        <ol class="pages">
          <li v-for="(page, index) in pages" :key="page ?? `gap-${index}`">
            <span v-if="page === null" class="gap" aria-hidden="true">…</span>
            <button
              v-else
              type="button"
              class="page-btn num"
              :class="{ current: page === currentPage }"
              :aria-current="page === currentPage ? 'page' : undefined"
              :aria-label="`Página ${page}`"
              @click="goTo(page)"
            >
              {{ page }}
            </button>
          </li>
        </ol>

        <span class="compact num" aria-hidden="true">{{ currentPage }} / {{ pageCount }}</span>

        <button
          type="button"
          class="page-btn step"
          :disabled="currentPage === pageCount"
          aria-label="Página siguiente"
          @click="goTo(currentPage + 1)"
        >
          <span class="step-label">Siguiente</span>
          <ChevronRight :size="17" />
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding: 0 4px;
}
.range {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.range strong {
  color: var(--text);
  font-weight: 700;
}
.controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pages {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
}
.page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.88rem;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s var(--ease-out);
}
.page-btn:hover:not(:disabled, .current) {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text);
}
.page-btn:active:not(:disabled) {
  transform: scale(0.95);
}
.page-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.page-btn.current {
  background: var(--primary);
  color: var(--primary-contrast);
  box-shadow: 0 6px 14px -8px var(--primary);
}
.page-btn.step {
  border-color: var(--border);
  background: var(--surface);
  color: var(--text);
}
.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.gap {
  display: inline-block;
  min-width: 22px;
  text-align: center;
  color: var(--text-soft);
}
.compact {
  display: none;
  min-width: 64px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
}

/* Phones: "Anterior · 2 / 7 · Siguiente" across the full width instead of every page number */
@media (max-width: 560px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }
  .range {
    text-align: center;
  }
  .controls {
    justify-content: space-between;
  }
  .pages {
    display: none;
  }
  .compact {
    display: block;
  }
  .page-btn.step {
    height: 44px;
    padding: 0 14px;
  }
}
</style>
