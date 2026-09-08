<script setup lang="ts">
// Imports
import { ref, computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-vue-next';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import BudgetSummaryTable from '@/components/reports/BudgetSummaryTable.vue';
import type { SummaryRow } from '@/components/reports/BudgetSummaryTable.vue';
import StatCard from '@/components/shared/StatCard.vue';
import RadialProgress from '@/components/shared/RadialProgress.vue';
import { ReportAnalytics } from '@/utils/ReportAnalytics.js';
import { Formatters } from '@/utils/formatters.js';
import { DateRange } from '@/utils/DateRange.js';
import { MONTH_OPTIONS } from '@/utils/constants.js';
import type { FilterOption } from '@/utils/constants.js';

// State
const now = new Date();
const selYear = ref(String(now.getFullYear()));
const selMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

// Computed
const years = computed<FilterOption[]>(() =>
  ReportAnalytics.getAvailableYears().map((year) => ({ value: String(year), label: String(year) })),
);

const monthName = computed(() => MONTH_OPTIONS.find((month) => month.value === selMonth.value)?.label ?? '');

const period = computed(() => DateRange.ofMonth(selYear.value, selMonth.value));
const periodStart = computed(() => period.value.start);
const periodEnd = computed(() => period.value.end);

const summary = computed(() => ReportAnalytics.getPeriodSummary(periodStart.value, periodEnd.value));

// Line chart: cumulative balance evolution across the selected year
const lineChart = computed(() => ({
  labels: MONTH_OPTIONS.map((month) => month.label.slice(0, 3)),
  datasets: [
    {
      label: 'Balance acumulado',
      data: ReportAnalytics.getCumulativeBalanceByMonth(selYear.value),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#10b981',
      borderWidth: 2.5,
    },
  ],
}));

// Bar chart: budget vs actual (expense activities) for the selected period
const budgetVsActual = computed(() => ReportAnalytics.getBudgetVsActual(periodStart.value, periodEnd.value));

const budgetChart = computed(() => ({
  labels: budgetVsActual.value.map((row) => row.name),
  datasets: [
    {
      label: 'Presupuesto',
      data: budgetVsActual.value.map((row) => row.budget),
      backgroundColor: '#cbd5e1',
      borderRadius: 6,
      maxBarThickness: 26,
    },
    {
      label: 'Gasto real',
      data: budgetVsActual.value.map((row) => row.spent),
      backgroundColor: '#10b981',
      borderRadius: 6,
      maxBarThickness: 26,
    },
  ],
}));
const hasBudget = computed(() => budgetChart.value.labels.length > 0);

// Savings progress (all-time, unlike the budget/expense figures above which are period-scoped)
const savingsActs = computed(() => ReportAnalytics.getSavingsProgress());

const summaryRows = computed<SummaryRow[]>(() =>
  budgetVsActual.value.map((row) => ({
    id: row.activityId,
    name: row.name,
    color: row.color,
    budget: row.budget,
    spent: row.spent,
    diff: row.diff,
  })),
);
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Reportes</h2>
        <p class="muted">Analiza tu evolución financiera y el cumplimiento de presupuestos.</p>
      </div>
      <div class="period card">
        <SelectorFilter label="Mes" v-model="selMonth" :options="MONTH_OPTIONS" placeholder="" />
        <SelectorFilter label="Año" v-model="selYear" :options="years" placeholder="" />
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid-kpi mb">
      <StatCard
        title="Ingresos del periodo"
        :value="Formatters.formatToCOP(summary.totalIncome)"
        :icon="TrendingUp"
        variant="income"
        :trend="`${monthName} ${selYear}`"
      />
      <StatCard
        title="Gastos del periodo"
        :value="Formatters.formatToCOP(summary.totalExpense)"
        :icon="TrendingDown"
        variant="expense"
        :trend="`${monthName} ${selYear}`"
        :trendUp="false"
      />
      <StatCard
        title="Balance neto"
        :value="Formatters.formatToCOP(summary.netBalance)"
        :icon="Wallet"
        :variant="summary.netBalance >= 0 ? 'income' : 'expense'"
        :trend="summary.netBalance >= 0 ? 'Ahorro positivo' : 'Gasto excesivo'"
        :trendUp="summary.netBalance >= 0"
      />
    </div>

    <!-- Charts -->
    <div class="grid-charts">
      <section class="card panel">
        <div class="panel-head">
          <h3>Evolución del balance</h3>
          <span class="badge badge-gray">{{ selYear }}</span>
        </div>
        <ChartGraphic
          type="line"
          :labels="lineChart.labels"
          :datasets="lineChart.datasets"
          :height="300"
          :options="{ plugins: { legend: { display: false } } }"
        />
      </section>

      <section class="card panel">
        <div class="panel-head">
          <h3>Presupuesto vs. gasto real</h3>
          <span class="badge badge-gray">{{ monthName }}</span>
        </div>
        <ChartGraphic
          v-if="hasBudget"
          type="bar"
          :labels="budgetChart.labels"
          :datasets="budgetChart.datasets"
          :height="300"
        />
        <div v-else class="empty-chart"><p class="muted">No hay actividades de gasto.</p></div>
      </section>
    </div>

    <!-- Savings progress -->
    <section v-if="savingsActs.length" class="card panel mb">
      <div class="panel-head">
        <h3><PiggyBank :size="18" style="vertical-align: -3px" /> Progreso de metas de ahorro</h3>
      </div>
      <div class="savings">
        <div v-for="activity in savingsActs" :key="activity.id" class="saving">
          <RadialProgress :value="activity.percent" :label="activity.name" :color="activity.color" :height="150" />
          <div class="saving-top">
            <span class="saving-name">{{ activity.name }}</span>
            <span class="soft">{{ Formatters.formatToCOP(activity.saved) }} / {{ Formatters.formatToCOP(activity.targetAmount) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Summary table -->
    <section>
      <h3 class="section-title">Resumen por actividad · {{ monthName }} {{ selYear }}</h3>
      <BudgetSummaryTable :rows="summaryRows" />
    </section>
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
  margin-bottom: 20px;
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
.section-title {
  font-size: 1.05rem;
  margin-bottom: 14px;
}
.savings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 22px;
}
.saving {
  text-align: center;
}
.saving-top {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  font-size: 0.88rem;
}
.saving-name {
  font-weight: 600;
}
@media (max-width: 900px) {
  .grid-charts {
    grid-template-columns: 1fr;
  }
}
</style>
