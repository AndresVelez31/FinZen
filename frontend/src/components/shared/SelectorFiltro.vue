<script setup lang="ts">
interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  modelValue: string;
  options: FilterOption[];
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Todos',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function onChange(event: Event): void {
  const target = event.target;

  if (!(target instanceof HTMLSelectElement)) {
    return;
  }

  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="field selector">
    <label v-if="label">
      {{ label }}
    </label>

    <select
      class="select"
      :value="modelValue"
      :aria-label="label || placeholder"
      @change="onChange"
    >
      <option value="">
        {{ placeholder }}
      </option>

      <option
        v-for="option in options"
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