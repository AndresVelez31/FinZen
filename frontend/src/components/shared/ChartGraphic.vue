<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import {
  Chart,
  registerables,
  type ChartType,
  type ChartDataset,
  type ChartOptions,
} from 'chart.js';

Chart.register(...registerables);

/**
 * Reusable Chart.js wrapper without domain dependencies.
 */

interface Props {
  type: ChartType | string;
  labels?: string[];
  datasets?: ChartDataset[] | any[];
  options?: ChartOptions | Record<string, any>;
  title?: string;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => [],
  datasets: () => [],
  options: () => ({}),
  height: 280,
});

const canvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
let themeObserver: MutationObserver | null = null;

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
  const isPieOrDoughnut = props.type === 'doughnut' || props.type === 'pie';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: props.title
        ? {
            display: true,
            text: props.title,
            color: c.text,
          }
        : { display: false },
      legend: {
        display: isPieOrDoughnut,
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
    scales: isPieOrDoughnut
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

function renderChart() {
  if (!canvas.value) return;
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas.value, {
    type: props.type as ChartType,
    data: {
      labels: props.labels,
      datasets: props.datasets,
    },
    options: baseOptions() as ChartOptions,
  });
}

onMounted(() => {
  renderChart();

  // Escuchar cambios de tema (dark mode) mediante cambios de atributos en <html>
  themeObserver = new MutationObserver(() => {
    nextTick(renderChart);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
});

watch(
  () => [props.labels, props.datasets, props.type, props.options],
  () => nextTick(renderChart),
  { deep: true },
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
