<script setup lang="ts">
interface FilterOption {
  label: string;
  value: string;
}

const props = defineProps<{
  label?: string;
  modelValue: string;
  options: FilterOption[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

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
      <option value="">
        {{ props.placeholder || 'Todos' }}
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