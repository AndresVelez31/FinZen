<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import GenericTable from '@/components/shared/GenericTable.vue';
import StatCard from '@/components/shared/StatCard.vue';
import { myTransactions, myActivities, formatMoney, monthKey } from '@/store';

interface FilterOption {
  label: string;
  value: string;
}

const now = new Date();
const selYear = ref(String(now.getFullYear()));
const selMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

const years = computed(() => {
  const set = new Set(myTransactions.value.map((t) => new Date(t.date).getFullYear()));
  set.add(now.getFullYear());
  return [...set].sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) }));
});

const months: FilterOption[] = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

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
        <ChartGraphic
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
        <ChartGraphic
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