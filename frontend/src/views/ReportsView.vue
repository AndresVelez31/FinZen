<script setup lang="ts">
// Vue Core
import { computed, ref } from 'vue';

// Third-party libraries
import { PiggyBank, TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next';

// Components (src/components/share)
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import GenericTable from '@/components/shared/GenericTable.vue';
import RadialProgress from '@/components/shared/RadialProgress.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import StatCard from '@/components/shared/StatCard.vue';

// Types (import type required by verbatimModuleSyntax)
import type { TableColumn } from '@/components/shared/GenericTable.vue';

// Services according to business logic layer (View → Service → Store)
import { ReportService } from '@/services/ReportService.js';
import { Formatters } from '@/utils/formatters.js';

// Local presentation types
interface FilterOption {
  label: string;
  value: string;
}

interface SummaryRow {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
  diff: number;
}

// Filters (month/year)
const now = new Date();
const selYear = ref(String(now.getFullYear()));
const selMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

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

// Data services
const years = computed<FilterOption[]>(() => {
  const set = new Set(
    ReportService.getUserTransactions().map((transaction) =>
      Number(transaction.date.slice(0, 4)),
    ),
  );

  set.add(now.getFullYear());

  return [...set]
    .sort((a, b) => b - a)
    .map((year) => ({
      value: String(year),
      label: String(year),
    }));
});

const monthName = computed(
  () => months.find((month) => month.value === selMonth.value)?.label ?? '',
);

const periodStart = computed(() => `${selYear.value}-${selMonth.value}-01`);
const periodEnd = computed(() => {
  const lastDay = new Date(Number(selYear.value), Number(selMonth.value), 0).getDate();
  return `${selYear.value}-${selMonth.value}-${String(lastDay).padStart(2, '0')}`;
});

const summary = computed(() => ReportService.getPeriodSummary(periodStart.value, periodEnd.value));

// Line chart, cumulative balance evolution across the selected year
const cumulativeBalance = computed(() =>
  ReportService.getCumulativeBalanceByYear(Number(selYear.value)),
);

const lineChart = computed(() => ({
  labels: months.map((month) => month.label.slice(0, 3)),
  datasets: [
    {
      label: 'Balance acumulado',
      data: cumulativeBalance.value.map((point) => point.balance),
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

// Bar chart, budget vs actual (expense activities) for the selected period
const budgetExecution = computed(() =>
  ReportService.getBudgetExecution(periodStart.value, periodEnd.value),
);

const budgetChart = computed(() => ({
  labels: budgetExecution.value.map((item) => item.name),
  datasets: [
    {
      label: 'Presupuesto',
      data: budgetExecution.value.map((item) => item.budget),
      backgroundColor: '#cbd5e1',
      borderRadius: 6,
      maxBarThickness: 26,
    },
    {
      label: 'Gasto real',
      data: budgetExecution.value.map((item) => item.spent),
      backgroundColor: '#10b981',
      borderRadius: 6,
      maxBarThickness: 26,
    },
  ],
}));

const hasBudget = computed(() => budgetExecution.value.length > 0);

// Saving progress
const savingsActs = computed(() =>
  ReportService.getSavingsProgress(),
);

// Summary Table
const summaryRows = computed<SummaryRow[]>(() =>
  budgetExecution.value.map((item) => ({
    id: item.activityId,
    name: item.name,
    color: item.color,
    budget: item.budget,
    spent: item.spent,
    diff: item.difference,
  })),
);

const summaryColumns: TableColumn[] = [
  { key: 'name', label: 'Actividad' },
  { key: 'budget', label: 'Presupuesto', align: 'right' },
  { key: 'spent', label: 'Gasto real', align: 'right' },
  { key: 'diff', label: 'Diferencia', align: 'right' },
];

// Functions
function asSummaryRow(row: unknown): SummaryRow {
  return row as SummaryRow;
}

</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Reportes</h2>
        <p class="muted">Analiza tu evolución financiera y el cumplimiento de presupuestos.</p>
      </div>
      <div class="period card">
        <SelectorFilter label="Mes" v-model="selMonth" :options="months" placeholder="" />
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
          <RadialProgress
            :value="activity.percent"
            :label="activity.name"
            :color="activity.color"
            :height="150"
          />
          <div class="saving-top">
            <span class="saving-name">{{ activity.name }}</span>
            <span class="soft"
              >{{ Formatters.formatToCOP(activity.saved) }} /
              {{ Formatters.formatToCOP(activity.targetAmount) }}</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Summary table -->
    <section>
      <h3 class="section-title">Resumen por actividad · {{ monthName }} {{ selYear }}</h3>
      <GenericTable
        :columns="summaryColumns"
        :rows="summaryRows"
        emptyTitle="Sin datos"
        emptyText="No hay actividades de gasto para este periodo."
      >
        <template #cell-name="{ row }">
          <div class="rn">
            <span class="dot" :style="{ background: asSummaryRow(row).color }"></span
            >{{ asSummaryRow(row).name }}
          </div>
        </template>
        <template #cell-budget="{ value }">{{ Formatters.formatToCOP(Number(value)) }}</template>
        <template #cell-spent="{ value }">{{ Formatters.formatToCOP(Number(value)) }}</template>
        <template #cell-diff="{ value }">
          <span :class="Number(value) >= 0 ? 'pos' : 'neg'">
            {{ Number(value) >= 0 ? '+' : '' }}{{ Formatters.formatToCOP(Number(value)) }}
          </span>
        </template>
      </GenericTable>
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
.rn {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 600;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.pos {
  color: var(--primary-strong);
  font-weight: 700;
}
html.dark .pos {
  color: var(--primary);
}
.neg {
  color: var(--danger);
  font-weight: 700;
}
@media (max-width: 900px) {
  .grid-charts {
    grid-template-columns: 1fr;
  }
}
</style>
