<script setup lang="ts">
// @ts-nocheck
/**
 * Reusable labelled dropdown filter.
 * Props:
 *  - label: field label
 *  - modelValue: current value (v-model)
 *  - options: [{ value, label }]
 *  - placeholder: text for the "all/none" default option
 * Emits:
 *  - update:modelValue
 *  - change (value)
 */
defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Todos' },
});

const emit = defineEmits(['update:modelValue', 'change']);

function onChange(e) {
  const val = e.target.value;
  emit('update:modelValue', val);
  emit('change', val);
}
</script>

<template>
  <div class="field selector">
    <label v-if="label">{{ label }}</label>
    <select class="select" :value="modelValue" @change="onChange">
      <option value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.selector {
  min-width: 160px;
}
</style>
