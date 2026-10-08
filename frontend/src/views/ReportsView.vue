<script setup lang="ts">
// External imports
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';

// Internal imports
import BudgetSummaryTable from '@/components/reports/BudgetSummaryTableComponent.vue';
import ChartGraphic from '@/components/shared/ChartGraphicComponent.vue';
import RadialProgress from '@/components/shared/RadialProgressComponent.vue';
import SelectorFilter from '@/components/shared/SelectorFilterComponent.vue';
import StatCard from '@/components/shared/StatCardComponent.vue';
import { MONTH_OPTIONS } from '@/enums/constants.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { ActivityService } from '@/services/ActivityService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { ActivityUtil } from '@/utils/ActivityUtil.js';
import { DateRangeUtil } from '@/utils/DateRangeUtil.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';
import { TransactionUtil } from '@/utils/TransactionUtil.js';

// Variables
const now = new Date();

// Reactive variables
const activities = ref<ActivityInterface[]>([]);
const transactions = ref<TransactionInterface[]>([]);

// Selectors
const years = computed<FilterOptionInterface[]>(() =>
  TransactionUtil.collectAvailableYears(transactions.value).map((year) => ({
    value: String(year),
    label: String(year),
  })),
);

const selectedYear = ref(String(now.getFullYear()));
const selectedMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

// Computed
const monthName = computed(
  () => MONTH_OPTIONS.find((month) => month.value === selectedMonth.value)?.label ?? '',
);

const period = computed(() =>
  DateRangeUtil.buildMonthRange(selectedYear.value, selectedMonth.value),
);

const periodTransactions = computed(() =>
  TransactionUtil.filterByCriteria(transactions.value, {
    from: period.value.start,
    to: period.value.end,
  }),
);

const summary = computed(() => TransactionUtil.summarizeIncomeAndExpense(periodTransactions.value));

// Line chart: cumulative balance evolution across the selected year
const lineChart = computed(() => ({
  labels: MONTH_OPTIONS.map((month) => month.label.slice(0, 3)),
  datasets: [
    {
      label: 'Balance acumulado',
      data: TransactionUtil.accumulateBalanceByMonth(transactions.value, selectedYear.value),
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

// Bar chart and summary table: budget vs actual (expense activities) for the selected period
const budgetVsActual = computed(() =>
  ActivityUtil.compareBudgetWithSpending(
    activities.value,
    transactions.value,
    period.value.start,
    period.value.end,
  ),
);

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
const hasBudgetChart = computed(() => budgetChart.value.labels.length > 0);

// Savings progress (all-time, unlike the period-scoped figures above)
const savingsActivities = computed(() =>
  ActivityUtil.calculateSavingsProgress(activities.value, transactions.value),
);

// Lifecycle
onMounted(async () => {
  try {
    activities.value = await ActivityService.getAllByUserId();
    transactions.value = await TransactionService.getAllByUserId();
  } catch (error) {
    await Swal.fire({
      title: 'No se pudieron cargar los reportes',
      text: (error as Error).message,
      icon: 'error',
    });
  }
});
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Reportes</h2>
        <p class="muted">Analiza tu evolución financiera y el cumplimiento de presupuestos.</p>
      </div>
      <div class="period card">
        <SelectorFilter label="Mes" v-model="selectedMonth" :options="MONTH_OPTIONS" placeholder="" />
        <SelectorFilter label="Año" v-model="selectedYear" :options="years" placeholder="" />
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid-kpi mb">
      <StatCard
        title="Ingresos del periodo"
        :value="FormattersUtil.formatToCOP(summary.totalIncome)"
        :icon="TrendingUp"
        variant="income"
        :trend="`${monthName} ${selectedYear}`"
      />
      <StatCard
        title="Gastos del periodo"
        :value="FormattersUtil.formatToCOP(summary.totalExpense)"
        :icon="TrendingDown"
        variant="expense"
        :trend="`${monthName} ${selectedYear}`"
        :trendUp="false"
      />
      <StatCard
        title="Balance neto"
        :value="FormattersUtil.formatToCOP(summary.netBalance)"
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
          <span class="badge badge-gray">{{ selectedYear }}</span>
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
          v-if="hasBudgetChart"
          type="bar"
          :labels="budgetChart.labels"
          :datasets="budgetChart.datasets"
          :height="300"
        />
        <div v-else class="empty-chart"><p class="muted">No hay actividades de gasto.</p></div>
      </section>
    </div>

    <!-- Savings progress -->
    <section v-if="savingsActivities.length" class="card panel mb">
      <div class="panel-head">
        <h3><PiggyBank :size="18" style="vertical-align: -3px" /> Progreso de metas de ahorro</h3>
      </div>
      <div class="savings">
        <div v-for="activity in savingsActivities" :key="activity.id" class="saving">
          <RadialProgress :value="activity.percent" :label="activity.name" :color="activity.color" :height="150" />
          <div class="saving-top">
            <span class="saving-name">{{ activity.name }}</span>
            <span class="soft">{{ FormattersUtil.formatToCOP(activity.saved) }} / {{ FormattersUtil.formatToCOP(activity.targetAmount) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Summary table -->
    <section>
      <h3 class="section-title">Resumen por actividad · {{ monthName }} {{ selectedYear }}</h3>
      <BudgetSummaryTable :rows="budgetVsActual" />
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
