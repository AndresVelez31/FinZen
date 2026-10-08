<script setup lang="ts">
// External imports
import { computed } from 'vue';

// Props
// The model holds only the digits ("800000"); the field shows them grouped ("800.000").
const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    maxDigits?: number;
  }>(),
  {
    placeholder: '0',
    disabled: false,
    invalid: false,
    maxDigits: 13,
  },
);

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Computed
const displayValue = computed(() => groupThousands(toDigits(props.modelValue)));

// Actions
// A value loaded from the API may come with decimals ("800000.00"); pesos have none.
function toDigits(value: string): string {
  if (/^\d+\.\d{1,2}$/.test(value)) {
    return String(Math.round(Number(value)));
  }
  return value.replace(/\D/g, '');
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Keeps the caret after the same digit it was after, even when a dot appears or disappears.
function onInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const caret = input.selectionStart ?? input.value.length;
  const digitsBeforeCaret = input.value.slice(0, caret).replace(/\D/g, '').length;
  const digits = input.value
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, props.maxDigits);
  const formatted = groupThousands(digits);

  input.value = formatted;
  emit('update:modelValue', digits);

  let position = 0;
  let seenDigits = 0;
  while (position < formatted.length && seenDigits < digitsBeforeCaret) {
    if (/\d/.test(formatted[position] ?? '')) {
      seenDigits++;
    }
    position++;
  }
  input.setSelectionRange(position, position);
}
</script>

<template>
  <div class="money" :class="{ invalid: props.invalid, disabled: props.disabled }">
    <span class="money-sign" aria-hidden="true">$</span>
    <input
      :id="props.id"
      class="input money-input num"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :value="displayValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :aria-invalid="props.invalid"
      @input="onInput"
    />
    <span class="money-code" aria-hidden="true">COP</span>
  </div>
</template>

<style scoped>
.money {
  position: relative;
  display: flex;
  align-items: center;
}
.money-sign {
  position: absolute;
  left: 15px;
  font-family: var(--font-head);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-soft);
  pointer-events: none;
  transition: color 0.2s ease;
}
.money:focus-within .money-sign {
  color: var(--primary-strong);
}
html.dark .money:focus-within .money-sign {
  color: var(--primary);
}
.money-input {
  min-height: 54px;
  padding-left: 36px;
  padding-right: 58px;
  font-family: var(--font-head);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.money-code {
  position: absolute;
  right: 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  background: var(--surface-2);
  padding: 3px 7px;
  border-radius: 6px;
  pointer-events: none;
}
.money.invalid .money-input {
  border-color: var(--danger);
}
@media (max-width: 560px) {
  .money-input {
    font-size: 1.3rem;
  }
}
</style>
