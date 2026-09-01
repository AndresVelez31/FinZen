<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';

/**
 * Reusable ApexCharts radial-bar wrapper without domain dependencies.
 * Used where a gauge-style progress indicator communicates better than
 * a Chart.js chart (e.g. savings goal completion).
 */

interface Props {
  value: number;
  label: string;
  color?: string;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#10b981',
  height: 180,
});

const isDark = ref(document.documentElement.classList.contains('dark'));
let themeObserver: MutationObserver | null = null;

onMounted(() => {
  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark');
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onUnmounted(() => {
  themeObserver?.disconnect();
  themeObserver = null;
});

const series = computed(() => [Math.min(100, Math.max(0, props.value))]);

const options = computed<ApexOptions>(() => ({
  chart: { type: 'radialBar', sparkline: { enabled: true } },
  colors: [props.color],
  labels: [props.label],
  stroke: { lineCap: 'round' },
  plotOptions: {
    radialBar: {
      hollow: { size: '62%' },
      track: { background: isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)' },
      dataLabels: {
        name: { show: false },
        value: {
          offsetY: 6,
          fontSize: '1.05rem',
          fontWeight: 700,
          color: isDark.value ? '#f1f5f9' : '#0f1720',
          formatter: (val: number) => `${Math.round(val)}%`,
        },
      },
    },
  },
}));
</script>

<template>
  <div class="radial-box">
    <VueApexCharts type="radialBar" :height="height" :options="options" :series="series" />
  </div>
</template>

<style scoped>
.radial-box {
  width: 100%;
}
</style>
