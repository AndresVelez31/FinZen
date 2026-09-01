<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next';
import GraficoChart from '@/components/shared/GraficoChart.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import TablaGenerica from '@/components/shared/TablaGenerica.vue';
import StatCard from '@/components/shared/StatCard.vue';
import { ReportService } from '@/services/ReportService.js';
import { formatToCOP } from '@/utils/formatters.js';

type PeriodValue = 'current' | '3m' | '6m' | 'all';

const PERIOD_OPTIONS: { value: PeriodValue; label: string }[] = [
  { value: 'current', label: 'Mes actual' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: 'all', label: 'Todo el tiempo' },
];

const period = ref<PeriodValue>('current');

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Resolves the selected period into an inclusive [start, end] ISO date range.
 * 'all' returns undefined bounds, since ReportService treats missing bounds as unbounded.
 */
const dateRange = computed<{ start?: string; end?: string }>(() => {
  const today = new Date();
  const end = toISODate(today);

  if (period.value === 'all') {
    return {};
  }

  const monthsBack = period.value === 'current' ? 0 : period.value === '3m' ? 2 : 5;
  const start = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);

  return { start: toISODate(start), end };
});

const summary = computed(() =>
  ReportService.getPeriodSummary(dateRange.value.start, dateRange.value.end),
);

const expensesByActivity = computed(() =>
  ReportService.getExpensesByActivity(dateRange.value.start, dateRange.value.end),
);

const hasExpensesByActivity = computed(() => expensesByActivity.value.length > 0);

const activityChart = computed(() => ({
  labels: expensesByActivity.value.map((entry) => entry.name),
  datasets: [
    {
      data: expensesByActivity.value.map((entry) => entry.total),
      backgroundColor: expensesByActivity.value.map((entry) => entry.color),
      borderWidth: 0,
    },
  ],
}));

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-CO', {
    month: 'short',
    year: '2-digit',
  });
}

const monthlyTotals = computed(() =>
  ReportService.getMonthlyTotals(dateRange.value.start, dateRange.value.end),
);

const hasMonthlyTotals = computed(() => monthlyTotals.value.length > 0);

const trendChart = computed(() => ({
  labels: monthlyTotals.value.map((entry) => monthLabel(entry.month)),
  datasets: [
    {
      label: 'Ingresos',
      data: monthlyTotals.value.map((entry) => entry.income),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
    {
      label: 'Gastos',
      data: monthlyTotals.value.map((entry) => entry.expense),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
}));
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Reportes</h2>
        <p class="muted">Analiza tus ingresos, gastos y hábitos de gasto por actividad.</p>
      </div>
      <div class="period card">
        <SelectorFilter
          label="Periodo"
          v-model="period"
          :options="PERIOD_OPTIONS"
          placeholder=""
        />
      </div>
    </div>

    <div class="grid-kpi mb">
      <StatCard
        label="Ingresos totales"
        :value="formatToCOP(summary.totalIncome)"
        :icon="TrendingUp"
        accent="var(--info)"
      />
      <StatCard
        label="Gastos totales"
        :value="formatToCOP(summary.totalExpense)"
        :icon="TrendingDown"
        accent="var(--danger)"
      />
      <StatCard
        label="Balance neto"
        :value="formatToCOP(summary.netBalance)"
        :icon="Wallet"
        :accent="summary.netBalance >= 0 ? 'var(--primary)' : 'var(--danger)'"
      />
    </div>

    <div class="grid-charts">
      <section class="card panel">
        <div class="panel-head">
          <h3>Gastos por actividad</h3>
        </div>
        <GraficoChart
          v-if="hasExpensesByActivity"
          type="doughnut"
          :labels="activityChart.labels"
          :datasets="activityChart.datasets"
          :height="300"
        />
        <div v-else class="empty-chart"><p class="muted">Sin gastos en este periodo.</p></div>
      </section>

      <section class="card panel">
        <div class="panel-head">
          <h3>Tendencia mensual</h3>
        </div>
        <GraficoChart
          v-if="hasMonthlyTotals"
          type="line"
          :labels="trendChart.labels"
          :datasets="trendChart.datasets"
          :height="300"
        />
        <div v-else class="empty-chart"><p class="muted">Sin movimientos en este periodo.</p></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.period {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}
.mb {
  margin-bottom: 20px;
}
.grid-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.panel {
  padding: 22px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.panel-head h3 {
  font-size: 1.05rem;
}
.empty-chart {
  height: 300px;
  display: grid;
  place-items: center;
}
@media (max-width: 900px) {
  .grid-charts {
    grid-template-columns: 1fr;
  }
}
</style>