<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-vue-next';
import GraficoChart from '@/components/shared/GraficoChart.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import TablaGenerica from '@/components/shared/TablaGenerica.vue';
import StatCard from '@/components/shared/StatCard.vue';
import { myTransactions, myActivities, formatMoney, monthKey } from '@/services/ReportService.js';

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

const periodKey = computed(() => `${selYear.value}-${selMonth.value}`);
const monthName = computed(() => months.find((m) => m.value === selMonth.value)?.label || '');

const periodTx = computed(() =>
  myTransactions.value.filter((t) => monthKey(t.date) === periodKey.value),
);

const summary = computed(() => {
  const income = periodTx.value
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expense = periodTx.value
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
});

/* ---- Line chart: monthly balance evolution for selected year ---- */
const lineChart = computed(() => {
  const labels = months.map((m) => m.label.slice(0, 3));
  const net = [];
  let running = 0;
  for (let i = 1; i <= 12; i++) {
    const key = `${selYear.value}-${String(i).padStart(2, '0')}`;
    const tx = myTransactions.value.filter((t) => monthKey(t.date) === key);
    const inc = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    running += inc - exp;
    net.push(Math.round(running));
  }
  return {
    labels,
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

/* ---- Bar chart: budget vs actual (expense activities) ---- */
const expenseActs = computed(() => myActivities.value.filter((a) => a.type === 'expense'));
const budgetChart = computed(() => {
  const acts = expenseActs.value;
  const actual = acts.map((a) =>
    periodTx.value
      .filter((t) => t.activityId === a.id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
  );
  return {
    labels: acts.map((a) => a.name),
    datasets: [
      {
        label: 'Presupuesto',
        data: acts.map((a) => a.targetAmount),
        backgroundColor: '#cbd5e1',
        borderRadius: 6,
        maxBarThickness: 26,
      },
      {
        label: 'Gasto real',
        data: actual,
        backgroundColor: '#10b981',
        borderRadius: 6,
        maxBarThickness: 26,
      },
    ],
  };
});
const hasBudget = computed(() => budgetChart.value.labels.length > 0);

/* ---- Savings progress ---- */
const savingsActs = computed(() =>
  myActivities.value
    .filter((a) => a.type === 'savings')
    .map((a) => {
      const saved = myTransactions.value
        .filter((t) => t.activityId === a.id && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const pct =
        a.targetAmount > 0 ? Math.min(100, Math.round((saved / a.targetAmount) * 100)) : 0;
      return { ...a, saved, pct };
    }),
);

/* ---- Summary table ---- */
const summaryRows = computed(() =>
  expenseActs.value.map((a) => {
    const spent = periodTx.value
      .filter((t) => t.activityId === a.id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const diff = a.targetAmount - spent;
    return { id: a.id, name: a.name, color: a.color, budget: a.targetAmount, spent, diff };
  }),
);
const summaryColumns = [
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
        label="Ingresos del periodo"
        :value="formatMoney(summary.income)"
        :icon="TrendingUp"
        accent="var(--info)"
        :trend="`${monthName} ${selYear}`"
      />
      <StatCard
        label="Gastos del periodo"
        :value="formatMoney(summary.expense)"
        :icon="TrendingDown"
        accent="var(--danger)"
        :trendUp="false"
        :trend="`${monthName} ${selYear}`"
      />
      <StatCard
        label="Balance neto"
        :value="formatMoney(summary.net)"
        :icon="Wallet"
        :accent="summary.net >= 0 ? 'var(--primary)' : 'var(--danger)'"
        :trendUp="summary.net >= 0"
        :trend="summary.net >= 0 ? 'Ahorro positivo' : 'Gasto excesivo'"
      />
    </div>

    <!-- Charts -->
    <div class="grid-charts">
      <section class="card panel">
        <div class="panel-head">
          <h3>Evolución del balance</h3>
          <span class="badge badge-gray">{{ selYear }}</span>
        </div>
        <GraficoChart
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
        <GraficoChart
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
    <section class="card panel mb" v-if="savingsActs.length">
      <div class="panel-head">
        <h3><PiggyBank :size="18" style="vertical-align: -3px" /> Progreso de metas de ahorro</h3>
      </div>
      <div class="savings">
        <div v-for="s in savingsActs" :key="s.id" class="saving">
          <div class="saving-top">
            <span class="saving-name">{{ s.name }}</span>
            <span class="soft">{{ formatMoney(s.saved) }} / {{ formatMoney(s.targetAmount) }}</span>
          </div>
          <div class="bar"><span :style="{ width: s.pct + '%', background: s.color }"></span></div>
          <div class="saving-pct">{{ s.pct }}%</div>
        </div>
      </div>
    </section>

    <!-- Summary table -->
    <section>
      <h3 class="section-title">Resumen por actividad · {{ monthName }} {{ selYear }}</h3>
      <TablaGenerica
        :columns="summaryColumns"
        :rows="summaryRows"
        emptyTitle="Sin datos"
        emptyText="No hay actividades de gasto para este periodo."
      >
        <template #cell-name="{ row }">
          <div class="rn">
            <span class="dot" :style="{ background: row.color }"></span>{{ row.name }}
          </div>
        </template>
        <template #cell-budget="{ value }">{{ formatMoney(value) }}</template>
        <template #cell-spent="{ value }">{{ formatMoney(value) }}</template>
        <template #cell-diff="{ value }">
          <span :class="value >= 0 ? 'pos' : 'neg'"
            >{{ value >= 0 ? '+' : '' }}{{ formatMoney(value) }}</span
          >
        </template>
      </TablaGenerica>
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}
.saving-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.88rem;
}
.saving-name {
  font-weight: 600;
}
.bar {
  height: 9px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}
.saving-pct {
  margin-top: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
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
