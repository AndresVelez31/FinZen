<script setup lang="ts">
// External imports
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

// Internal imports
import type { CalendarDayInterface } from '@/interfaces/CalendarDayInterface.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

// Props
// The model is an ISO date ("2026-10-07") or '' for none, like a native date input.
const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    invalid?: boolean;
    min?: string;
    max?: string;
  }>(),
  {
    placeholder: 'Selecciona una fecha',
    disabled: false,
    clearable: false,
    invalid: false,
    min: '',
    max: '',
  },
);

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Variables
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = Array.from({ length: 12 }, (_, month) =>
  capitalize(
    new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2026, month, 1)),
    ),
  ),
);
const GAP = 6;

// Reactive variables
const isOpen = ref(false);
const viewMode = ref<'days' | 'months'>('days');
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const focusedIso = ref('');
const popoverStyle = ref<Record<string, string>>({});
const trigger = ref<HTMLButtonElement | null>(null);
const popover = ref<HTMLElement | null>(null);

// Computed
const todayIso = computed(() => {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
});

const displayValue = computed(() =>
  props.modelValue ? FormattersUtil.formatShortDate(props.modelValue) : '',
);

const monthTitle = computed(() => `${MONTH_NAMES[viewMonth.value]} ${viewYear.value}`);

// Six full weeks starting on Monday, so the grid never changes height between months.
const days = computed<CalendarDayInterface[]>(() => {
  const firstWeekday = (new Date(Date.UTC(viewYear.value, viewMonth.value, 1)).getUTCDay() + 6) % 7;
  const firstIso = toIso(viewYear.value, viewMonth.value, 1);
  return Array.from({ length: 42 }, (_, index) => {
    const iso = addDays(firstIso, index - firstWeekday);
    const date = isoToUtcDate(iso);
    return {
      iso,
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === viewMonth.value,
      isToday: iso === todayIso.value,
      isSelected: iso === props.modelValue,
      isDisabled: isOutOfRange(iso),
    };
  });
});

// Actions
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isoToUtcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

function addDays(iso: string, amount: number): string {
  const date = isoToUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + amount);
  return toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isOutOfRange(iso: string): boolean {
  return Boolean((props.min && iso < props.min) || (props.max && iso > props.max));
}

function showMonthOf(iso: string): void {
  const date = isoToUtcDate(iso);
  viewYear.value = date.getUTCFullYear();
  viewMonth.value = date.getUTCMonth();
}

function placePopover(): void {
  const rect = trigger.value?.getBoundingClientRect();
  if (!rect) {
    return;
  }
  const popoverWidth = 304;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - popoverWidth - 8));
  const opensUp = window.innerHeight - rect.bottom < 380 && rect.top > 380;
  popoverStyle.value = opensUp
    ? { left: `${left}px`, bottom: `${window.innerHeight - rect.top + GAP}px` }
    : { left: `${left}px`, top: `${rect.bottom + GAP}px` };
}

async function focusDay(iso: string): Promise<void> {
  focusedIso.value = iso;
  if (!iso.startsWith(toIso(viewYear.value, viewMonth.value, 1).slice(0, 7))) {
    showMonthOf(iso);
  }
  await nextTick();
  popover.value?.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`)?.focus();
}

async function open(): Promise<void> {
  if (props.disabled) {
    return;
  }
  const start = props.modelValue || todayIso.value;
  showMonthOf(start);
  viewMode.value = 'days';
  placePopover();
  isOpen.value = true;
  await focusDay(start);
}

function close(returnFocus = true): void {
  isOpen.value = false;
  if (returnFocus) {
    trigger.value?.focus();
  }
}

function select(day: CalendarDayInterface): void {
  if (day.isDisabled) {
    return;
  }
  emit('update:modelValue', day.iso);
  close();
}

function selectToday(): void {
  if (!isOutOfRange(todayIso.value)) {
    emit('update:modelValue', todayIso.value);
    close();
  }
}

function clear(): void {
  emit('update:modelValue', '');
  close();
}

function shiftMonth(amount: number): void {
  const date = new Date(Date.UTC(viewYear.value, viewMonth.value + amount, 1));
  viewYear.value = date.getUTCFullYear();
  viewMonth.value = date.getUTCMonth();
}

function pickMonth(month: number): void {
  viewMonth.value = month;
  viewMode.value = 'days';
  void focusDay(toIso(viewYear.value, month, 1));
}

function onDayKeydown(event: KeyboardEvent, day: CalendarDayInterface): void {
  const moves: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
  };
  if (event.key in moves) {
    event.preventDefault();
    void focusDay(addDays(day.iso, moves[event.key] ?? 0));
  } else if (event.key === 'PageUp' || event.key === 'PageDown') {
    event.preventDefault();
    const date = isoToUtcDate(day.iso);
    date.setUTCMonth(date.getUTCMonth() + (event.key === 'PageUp' ? -1 : 1));
    void focusDay(toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    const weekday = (isoToUtcDate(day.iso).getUTCDay() + 6) % 7;
    void focusDay(addDays(day.iso, event.key === 'Home' ? -weekday : 6 - weekday));
  }
}

function onDocumentPointerDown(event: PointerEvent): void {
  const target = event.target as Node;
  if (!trigger.value?.contains(target) && !popover.value?.contains(target)) {
    close(false);
  }
}

function onViewportChange(): void {
  if (isOpen.value) {
    placePopover();
  }
}

// Watchers
watch(isOpen, (opened) => {
  if (opened) {
    document.addEventListener('pointerdown', onDocumentPointerDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
  }
});

// Lifecycle
onBeforeUnmount(() => {
  isOpen.value = false;
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  window.removeEventListener('resize', onViewportChange);
  window.removeEventListener('scroll', onViewportChange, true);
});
</script>

<template>
  <div class="datepicker" :class="{ invalid: props.invalid }">
    <button
      :id="props.id"
      ref="trigger"
      type="button"
      class="input dp-trigger"
      :class="{ empty: !props.modelValue, active: isOpen }"
      :disabled="props.disabled"
      :aria-invalid="props.invalid"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="isOpen ? close() : open()"
    >
      <CalendarDays :size="17" class="dp-icon" />
      <span class="dp-value num">{{ displayValue || props.placeholder }}</span>
    </button>
    <button
      v-if="props.clearable && props.modelValue && !props.disabled"
      type="button"
      class="dp-clear"
      aria-label="Quitar fecha"
      @click="clear"
    >
      <X :size="14" />
    </button>

    <Teleport to="body">
      <Transition name="dp">
        <div v-if="isOpen" class="dp-layer">
          <div class="dp-backdrop" @click="close(false)"></div>
          <div
            ref="popover"
            class="dp-popover"
            role="dialog"
            aria-modal="true"
            aria-label="Elegir fecha"
            :style="popoverStyle"
            @keydown.esc.stop="close()"
          >
            <span class="dp-grabber" aria-hidden="true"></span>

            <div class="dp-head">
              <button
                type="button"
                class="dp-title"
                :aria-label="viewMode === 'days' ? 'Elegir mes' : 'Volver a los días'"
                @click="viewMode = viewMode === 'days' ? 'months' : 'days'"
              >
                {{ viewMode === 'days' ? monthTitle : viewYear }}
                <ChevronRight
                  :size="15"
                  class="dp-title-chevron"
                  :class="{ turned: viewMode === 'months' }"
                />
              </button>
              <div class="dp-nav">
                <button
                  type="button"
                  class="dp-nav-btn"
                  :aria-label="viewMode === 'days' ? 'Mes anterior' : 'Año anterior'"
                  @click="viewMode === 'days' ? shiftMonth(-1) : viewYear--"
                >
                  <ChevronLeft :size="17" />
                </button>
                <button
                  type="button"
                  class="dp-nav-btn"
                  :aria-label="viewMode === 'days' ? 'Mes siguiente' : 'Año siguiente'"
                  @click="viewMode === 'days' ? shiftMonth(1) : viewYear++"
                >
                  <ChevronRight :size="17" />
                </button>
              </div>
            </div>

            <div v-if="viewMode === 'days'" class="dp-days">
              <span
                v-for="weekday in WEEKDAYS"
                :key="weekday"
                class="dp-weekday"
                aria-hidden="true"
                >{{ weekday }}</span
              >
              <button
                v-for="day in days"
                :key="day.iso"
                type="button"
                class="dp-day num"
                :class="{
                  outside: !day.inMonth,
                  today: day.isToday,
                  selected: day.isSelected,
                }"
                :data-iso="day.iso"
                :tabindex="day.iso === focusedIso ? 0 : -1"
                :disabled="day.isDisabled"
                :aria-pressed="day.isSelected"
                :aria-label="FormattersUtil.formatDate(day.iso)"
                @click="select(day)"
                @keydown="onDayKeydown($event, day)"
              >
                {{ day.day }}
              </button>
            </div>

            <div v-else class="dp-months">
              <button
                v-for="(monthName, month) in MONTH_NAMES"
                :key="monthName"
                type="button"
                class="dp-month"
                :class="{ selected: month === viewMonth }"
                @click="pickMonth(month)"
              >
                {{ monthName.slice(0, 3) }}
              </button>
            </div>

            <div class="dp-foot">
              <button
                v-if="props.clearable"
                type="button"
                class="dp-link muted-link"
                @click="clear"
              >
                Borrar
              </button>
              <button
                type="button"
                class="dp-link"
                :disabled="isOutOfRange(todayIso)"
                @click="selectToday"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.datepicker {
  position: relative;
}
.dp-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  padding-right: 36px;
}
.dp-trigger.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.datepicker.invalid .dp-trigger {
  border-color: var(--danger);
}
.dp-icon {
  color: var(--text-soft);
  flex-shrink: 0;
}
.dp-trigger.active .dp-icon,
.dp-trigger:focus .dp-icon {
  color: var(--primary-strong);
}
.dp-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dp-trigger.empty .dp-value {
  color: var(--text-soft);
}
.dp-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
}
.dp-clear:hover {
  background: var(--surface-2);
  color: var(--text);
}

/* Popover: a floating card on desktop, a bottom sheet on phones */
.dp-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  pointer-events: none;
}
.dp-backdrop {
  display: none;
}
.dp-popover {
  position: fixed;
  width: 304px;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  transform-origin: top left;
}
.dp-grabber {
  display: none;
}
.dp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.dp-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  margin-left: -6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 0.98rem;
}
.dp-title:hover {
  background: var(--surface-2);
}
.dp-title-chevron {
  color: var(--text-soft);
  transition: transform 0.2s var(--ease-out);
}
.dp-title-chevron.turned {
  transform: rotate(90deg);
}
.dp-nav {
  display: flex;
  gap: 4px;
}
.dp-nav-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-muted);
}
.dp-nav-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}
.dp-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.dp-weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-soft);
  padding: 4px 0 6px;
}
.dp-day {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 0.86rem;
  font-weight: 500;
  transition:
    background 0.14s ease,
    color 0.14s ease;
}
.dp-day:hover:not(:disabled, .selected) {
  background: var(--surface-2);
}
.dp-day.outside {
  color: var(--text-soft);
}
.dp-day.today:not(.selected) {
  color: var(--primary-strong);
  font-weight: 700;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--primary) 55%, transparent);
}
html.dark .dp-day.today:not(.selected) {
  color: var(--primary);
}
.dp-day.selected {
  background: var(--primary);
  color: var(--primary-contrast);
  font-weight: 700;
}
.dp-day:disabled {
  color: var(--text-soft);
  opacity: 0.4;
  cursor: not-allowed;
}
.dp-day:focus-visible,
.dp-month:focus-visible,
.dp-nav-btn:focus-visible,
.dp-title:focus-visible,
.dp-link:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.dp-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 4px 0;
}
.dp-month {
  padding: 14px 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  font-size: 0.86rem;
}
.dp-month:hover {
  background: var(--surface-2);
}
.dp-month.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-strong);
}
html.dark .dp-month.selected {
  color: var(--primary);
}
.dp-foot {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.dp-link {
  border: none;
  background: transparent;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--primary-strong);
}
html.dark .dp-link {
  color: var(--primary);
}
.dp-link:hover:not(:disabled) {
  background: var(--primary-soft);
}
.dp-link.muted-link {
  color: var(--text-muted);
  margin-right: auto;
}
.dp-link.muted-link:hover {
  background: var(--surface-2);
}
.dp-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dp-enter-active,
.dp-leave-active {
  transition: opacity 0.16s ease;
}
.dp-enter-active .dp-popover,
.dp-leave-active .dp-popover {
  transition:
    transform 0.2s var(--ease-out),
    opacity 0.16s ease;
}
.dp-enter-from,
.dp-leave-to {
  opacity: 0;
}
.dp-enter-from .dp-popover,
.dp-leave-to .dp-popover {
  transform: scale(0.96) translateY(-4px);
}

@media (max-width: 560px) {
  .dp-layer {
    pointer-events: auto;
  }
  .dp-backdrop {
    display: block;
    position: absolute;
    inset: 0;
    background: rgba(5, 10, 12, 0.45);
  }
  .dp-popover {
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0;
    width: 100%;
    padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
    border-radius: 22px 22px 0 0;
    border-bottom: none;
  }
  .dp-grabber {
    display: block;
    width: 40px;
    height: 4px;
    margin: 0 auto 12px;
    border-radius: 999px;
    background: var(--border);
  }
  .dp-day {
    font-size: 0.98rem;
  }
  .dp-enter-from .dp-popover,
  .dp-leave-to .dp-popover {
    transform: translateY(100%);
  }
  .dp-enter-active .dp-popover,
  .dp-leave-active .dp-popover {
    transition: transform 0.28s var(--ease-out);
  }
}
</style>
