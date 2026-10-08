<script setup lang="ts">
// External imports
import { useId } from 'vue';

// Internal imports
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';

// Props
const props = defineProps<{
  label?: string;
  modelValue: string;
  options: FilterOptionInterface[];
  placeholder?: string;
}>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Variables
const selectId = useId();

// Actions
function onChange(event: Event): void {
  const select = event.target as HTMLSelectElement;

  emit('update:modelValue', select.value);
}
</script>

<template>
  <div class="field selector">
    <label v-if="props.label" :for="selectId">
      {{ props.label }}
    </label>

    <select
      :id="selectId"
      class="select"
      :class="{ chosen: Boolean(props.placeholder) && props.modelValue !== '' }"
      :value="props.modelValue"
      @change="onChange"
    >
      <option v-if="props.placeholder" value="">
        {{ props.placeholder }}
      </option>

      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.selector {
  min-width: 0;
}
/* A filter that is narrowing the list reads as active at a glance */
.select.chosen {
  border-color: color-mix(in srgb, var(--primary) 55%, var(--border));
  background-color: color-mix(in srgb, var(--primary) 6%, var(--surface));
  font-weight: 600;
}
</style>
