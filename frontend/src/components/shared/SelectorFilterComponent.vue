<script setup lang="ts">
// Imports
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

// Actions
function onChange(event: Event): void {
  const select = event.target as HTMLSelectElement;

  emit('update:modelValue', select.value);
}
</script>

<template>
  <div class="field selector">
    <label v-if="props.label">
      {{ props.label }}
    </label>

    <select
      class="select"
      :value="props.modelValue"
      @change="onChange"
    >
      <option v-if="props.placeholder" value="">
        {{ props.placeholder }}
      </option>

      <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.selector {
  min-width: 160px;
}
</style>