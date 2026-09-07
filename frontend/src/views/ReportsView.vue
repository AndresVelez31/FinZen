<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-vue-next';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import GenericTable from '@/components/shared/GenericTable.vue';
import type { TableColumn } from '@/components/shared/GenericTable.vue';
import StatCard from '@/components/shared/StatCard.vue';
import RadialProgress from '@/components/shared/RadialProgress.vue';
import { ActivityService } from '@/services/ActivityService.js';
import { ReportService } from '@/services/ReportService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { formatToCOP } from '@/utils/formatters.js';

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

function asSummaryRow(row: unknown): SummaryRow {
  return row as SummaryRow;
}

const now = new Date();
const selYear = ref(String(now.getFullYear()));
const selMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

const transactions = computed(() => TransactionService.getTransactions());

const years = computed<FilterOption[]>(() => {
  const set = new Set(transactions.value.map((transaction) => new Date(transaction.date).getFullYear()));
  set.add(now.getFullYear());
  return [...set].sort((a, b) => b - a).map((year) => ({ value: String(year), label: String(year) }));
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

const monthName = computed(() => months.find((month) => month.value === selMonth.value)?.label ?? '');

const periodStart = computed(() => `${selYear.value}-${selMonth.value}-01`);
const periodEnd = computed(() => {
  const lastDay = new Date(Number(selYear.value), Number(selMonth.value), 0).getDate();
  return `${selYear.value}-${selMonth.value}-${String(lastDay).padStart(2, '0')}`;
});

const summary = computed(() => ReportService.getPeriodSummary(periodStart.value, periodEnd.value));

/* ---- Line chart: cumulative balance evolution across the selected year ---- */
const lineChart = computed(() => {
  const monthlyTotals = ReportService.getMonthlyTotals(`${selYear.value}-01-01`, `${selYear.value}-12-31`);

  let running = 0;
  const net = months.map((month) => {
    const entry = monthlyTotals.find((total) => total.month === `${selYear.value}-${month.value}`);
    running += (entry?.income ?? 0) - (entry?.expense ?? 0);
    return Math.round(running);
  });

  return {
    labels: months.map((month) => month.label.slice(0, 3)),
    datasets: [
      {
        label: 'Balance acumulado',
        data: net,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
        borderWidth: 2.5,
      },
    ],
  };
});

/* ---- Bar chart: budget vs actual (expense activities) for the selected period ---- */
const expenseActivities = computed(() => ActivityService.getActivities().filter((activity) => activity.type === 'expense'));
const periodExpensesByActivity = computed(() =>
  ReportService.getExpensesByActivity(periodStart.value, periodEnd.value),
);

function actualFor(activityId: number): number {
  return periodExpensesByActivity.value.find((entry) => entry.activityId === activityId)?.total ?? 0;
}

const budgetChart = computed(() => {
  const acts = expenseActivities.value;
  return {
    labels: acts.map((activity) => activity.name),
    datasets: [
      {
        label: 'Presupuesto',
        data: acts.map((activity) => activity.targetAmount),
        backgroundColor: '#cbd5e1',
        borderRadius: 6,
        maxBarThickness: 26,
      },
      {
        label: 'Gasto real',
        data: acts.map((activity) => actualFor(activity.id)),
        backgroundColor: '#10b981',
        borderRadius: 6,
        maxBarThickness: 26,
      },
    ],
  };
});
const hasBudget = computed(() => budgetChart.value.labels.length > 0);

/* ---- Savings progress (all-time) ---- */
const savingsActivities = computed(() => ActivityService.getActivities().filter((activity) => activity.type === 'savings'));
const allTimeExpensesByActivity = computed(() => ReportService.getExpensesByActivity());

const savingsActs = computed(() =>
  savingsActivities.value.map((activity) => {
    const saved = allTimeExpensesByActivity.value.find((entry) => entry.activityId === activity.id)?.total ?? 0;
    const percent =
      activity.targetAmount > 0 ? Math.min(100, Math.round((saved / activity.targetAmount) * 100)) : 0;
    return { ...activity, saved, percent };
  }),
);

/* ---- Summary table ---- */
const summaryRows = computed(() =>
  expenseActivities.value.map((activity) => {
    const spent = actualFor(activity.id);
    return {
      id: activity.id,
      name: activity.name,
      color: activity.color,
      budget: activity.targetAmount,
      spent,
      diff: activity.targetAmount - spent,
    };
  }),
);
const summaryColumns: TableColumn[] = [
  { key: 'name', label: 'Actividad' },
  { key: 'budget', label: 'Presupuesto', align: 'right' },
  { key: 'spent', label: 'Gasto real', align: 'right' },
  { key: 'diff', label: 'Diferencia', align: 'right' },
];
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
        :value="formatToCOP(summary.totalIncome)"
        :icon="TrendingUp"
        variant="income"
        :trend="`${monthName} ${selYear}`"
      />
      <StatCard
        title="Gastos del periodo"
        :value="formatToCOP(summary.totalExpense)"
        :icon="TrendingDown"
        variant="expense"
        :trend="`${monthName} ${selYear}`"
        :trendUp="false"
      />
      <StatCard
        title="Balance neto"
        :value="formatToCOP(summary.netBalance)"
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
            <span class="soft">{{ formatToCOP(activity.saved) }} / {{ formatToCOP(activity.targetAmount) }}</span>
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
        <template #cell-budget="{ value }">{{ formatToCOP(Number(value)) }}</template>
        <template #cell-spent="{ value }">{{ formatToCOP(Number(value)) }}</template>
        <template #cell-diff="{ value }">
          <span :class="Number(value) >= 0 ? 'pos' : 'neg'">
            {{ Number(value) >= 0 ? '+' : '' }}{{ formatToCOP(Number(value)) }}
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
