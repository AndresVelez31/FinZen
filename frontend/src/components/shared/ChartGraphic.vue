<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { store } from '@/services/';

Chart.register(...registerables);

/**
 * Reusable Chart.js wrapper.
 * Props:
 *  - type: 'doughnut' | 'bar' | 'line' | ...
 *  - labels: string[]
 *  - datasets: Chart.js dataset objects
 *  - options: extra Chart.js options (merged)
 *  - height: canvas height in px
 */
const props = defineProps({
  type: { type: String, required: true },
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
  height: { type: Number, default: 280 },
});

const canvas = ref(null);
let chart = null;

function themeColors() {
  const styles = getComputedStyle(document.documentElement);
  const dark = document.documentElement.classList.contains('dark');
  return {
    text: styles.getPropertyValue('--text-muted').trim() || (dark ? '#9aa4ad' : '#667085'),
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.06)',
  };
}

function baseOptions() {
  const c = themeColors();
  const legend = props.type === 'doughnut' || props.type === 'pie';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: legend,
        position: 'bottom',
        labels: {
          color: c.text,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark')
          ? '#1b2024'
          : '#0f1720',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 10,
        borderWidth: 0,
        boxPadding: 6,
      },
    },
    scales:
      props.type === 'doughnut' || props.type === 'pie'
        ? {}
        : {
            x: {
              ticks: { color: c.text, font: { size: 11 } },
              grid: { color: c.grid, drawBorder: false },
              border: { display: false },
            },
            y: {
              ticks: { color: c.text, font: { size: 11 } },
              grid: { color: c.grid, drawBorder: false },
              border: { display: false },
            },
          },
    ...props.options,
  };
}

function render() {
  if (!canvas.value) return;
  if (chart) chart.destroy();
  chart = new Chart(canvas.value, {
    type: props.type,
    data: { labels: props.labels, datasets: props.datasets },
    options: baseOptions(),
  });
}

onMounted(render);
onBeforeUnmount(() => chart && chart.destroy());

watch(
  () => [props.labels, props.datasets, props.type],
  () => nextTick(render),
  { deep: true },
);
// re-render on theme change so colors adapt
watch(
  () => store.theme,
  () => nextTick(render),
);
</script>

<template>
  <div class="chart-box" :style="{ height: height + 'px' }">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
  width: 100%;
}
</style>
