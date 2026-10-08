<script setup lang="ts">
// External imports
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-vue-next';
import { computed, ref } from 'vue';

// Internal imports
import DatePicker from '@/components/shared/DatePickerComponent.vue';
import SelectorFilter from '@/components/shared/SelectorFilterComponent.vue';
import {
  EMPTY_TRANSACTION_FILTERS,
  MONTH_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from '@/enums/constants.js';
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';
import type { TransactionFiltersInterface } from '@/interfaces/TransactionFiltersInterface.js';

// Props
// The view owns the selected filters (v-model) and applies them; this component only lets the user pick them.
const props = defineProps<{
  modelValue: TransactionFiltersInterface;
  activityOptions: FilterOptionInterface[];
  accountOptions: FilterOptionInterface[];
}>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [filters: TransactionFiltersInterface];
}>();

// Reactive variables
// Only matters on phones, where the filters start folded so the list is visible first.
const isOpen = ref(false);

// Computed
const activeFilters = computed(() => Object.values(props.modelValue).filter(Boolean).length);

// Actions
function updateFilter(field: keyof TransactionFiltersInterface, value: string): void {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
}

function resetFilters(): void {
  emit('update:modelValue', { ...EMPTY_TRANSACTION_FILTERS });
}
</script>

<template>
  <section class="card filters" :class="{ open: isOpen }">
    <div class="filters-head">
      <button
        type="button"
        class="filters-toggle"
        :aria-expanded="isOpen"
        aria-controls="transaction-filters"
        @click="isOpen = !isOpen"
      >
        <SlidersHorizontal :size="17" />
        <span>Filtros</span>
        <span v-if="activeFilters" class="filters-count">{{ activeFilters }}</span>
        <ChevronDown :size="17" class="filters-chevron" />
      </button>
      <button v-if="activeFilters" type="button" class="btn btn-ghost btn-sm" @click="resetFilters">
        <RotateCcw :size="14" />
        Limpiar
      </button>
    </div>

    <div id="transaction-filters" class="filters-grid">
      <SelectorFilter
        label="Actividad"
        :model-value="props.modelValue.activityId"
        :options="props.activityOptions"
        placeholder="Todas"
        @update:model-value="updateFilter('activityId', $event)"
      />
      <SelectorFilter
        label="Cuenta"
        :model-value="props.modelValue.accountId"
        :options="props.accountOptions"
        placeholder="Todas"
        @update:model-value="updateFilter('accountId', $event)"
      />
      <SelectorFilter
        label="Tipo"
        :model-value="props.modelValue.type"
        :options="TRANSACTION_TYPE_OPTIONS"
        placeholder="Todos"
        @update:model-value="updateFilter('type', $event)"
      />
      <SelectorFilter
        label="Mes"
        :model-value="props.modelValue.month"
        :options="MONTH_OPTIONS"
        placeholder="Todos"
        @update:model-value="updateFilter('month', $event)"
      />

      <div class="field">
        <label for="filter-from">Desde</label>
        <DatePicker
          id="filter-from"
          :model-value="props.modelValue.from"
          placeholder="Cualquiera"
          clearable
          :max="props.modelValue.to"
          @update:model-value="updateFilter('from', $event)"
        />
      </div>

      <div class="field">
        <label for="filter-to">Hasta</label>
        <DatePicker
          id="filter-to"
          :model-value="props.modelValue.to"
          placeholder="Cualquiera"
          clearable
          :min="props.modelValue.from"
          @update:model-value="updateFilter('to', $event)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.filters {
  padding: 16px 20px 20px;
  margin-bottom: 20px;
}
.filters-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  margin-bottom: 14px;
}
.filters-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: default;
}
.filters-count {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-contrast);
  font-size: 0.74rem;
  font-weight: 700;
}
.filters-chevron {
  display: none;
  color: var(--text-soft);
  transition: transform 0.22s var(--ease-out);
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  align-items: end;
}

@media (max-width: 720px) {
  .filters {
    padding: 4px 16px;
  }
  .filters-head {
    min-height: 52px;
    margin-bottom: 0;
  }
  .filters-toggle {
    flex: 1;
    min-height: 44px;
    cursor: pointer;
  }
  .filters-chevron {
    display: block;
    margin-left: auto;
  }
  .filters.open .filters-chevron {
    transform: rotate(180deg);
  }
  .filters-grid {
    display: none;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 4px 0 16px;
  }
  .filters.open .filters-grid {
    display: grid;
  }
}
</style>
