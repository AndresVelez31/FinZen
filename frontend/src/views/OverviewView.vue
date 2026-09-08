<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Wallet, TrendingDown, TrendingUp, Plus, ArrowRight } from 'lucide-vue-next';
import StatCard from '@/components/shared/StatCard.vue';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import RecentTransactionsTable from '@/components/overview/RecentTransactionsTable.vue';
import { AccountService } from '@/services/AccountService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { AuthService } from '@/auth/AuthService.js';
import { ReportAnalytics } from '@/utils/ReportAnalytics.js';
import { DateRange } from '@/utils/DateRange.js';
import { Formatters } from '@/utils/formatters.js';

const router = useRouter();
const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 500));

const currentUser = computed(() => AuthService.getCurrentUser());
const transactions = computed(() => TransactionService.getAll());

const monthRange = DateRange.currentMonthFull();
const monthTransactions = computed(() => ReportAnalytics.getUserTransactions(monthRange.start, monthRange.end));
const monthExpenses = computed(() => monthTransactions.value.filter((transaction) => transaction.type === 'expense'));
const monthIncomes = computed(() => monthTransactions.value.filter((transaction) => transaction.type === 'income'));
const monthSummary = computed(() => ReportAnalytics.summarize(monthTransactions.value));

const totalBalance = computed(() => AccountService.getTotalBalance());

// Doughnut: expense by activity this month
const donut = computed(() => {
  const entries = ReportAnalytics.aggregateExpensesByActivity(monthTransactions.value);
  return {
    labels: entries.map((entry) => entry.name),
    datasets: [
      {
        data: entries.map((entry) => entry.total),
        backgroundColor: entries.map((entry) => entry.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});
const hasDonut = computed(() => donut.value.labels.length > 0);

const recentTransactions = computed(() => transactions.value.slice(0, 5));
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Hola, {{ currentUser?.name?.split(' ')[0] }}</h2>
        <p class="muted">Este es el resumen de tus finanzas de este mes.</p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'transactions.create' })">
        <Plus :size="18" /> Nueva transacción
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid-kpi">
      <StatCard
        title="Balance total"
        :value="Formatters.formatToCOP(totalBalance)"
        :icon="Wallet"
        trend="Suma de todas tus cuentas"
      />
      <StatCard
        title="Gasto del mes"
        :value="Formatters.formatToCOP(monthSummary.totalExpense)"
        :icon="TrendingDown"
        variant="expense"
        :trend="`${monthExpenses.length} movimientos`"
        :trendUp="false"
      />
      <StatCard
        title="Ingresos del mes"
        :value="Formatters.formatToCOP(monthSummary.totalIncome)"
        :icon="TrendingUp"
        variant="income"
        :trend="`${monthIncomes.length} movimientos`"
      />
    </div>

    <!-- Charts + recent -->
    <div class="grid-main">
      <section class="card panel">
        <div class="panel-head">
          <h3>Gasto por actividad</h3>
          <span class="badge badge-gray">Mes actual</span>
        </div>
        <ChartGraphic
          v-if="hasDonut"
          type="doughnut"
          :labels="donut.labels"
          :datasets="donut.datasets"
          :height="300"
          :options="{ cutout: '62%' }"
        />
        <div v-else class="empty-chart">
          <p class="muted">Aún no hay gastos registrados este mes.</p>
        </div>
      </section>

      <section class="card panel">
        <div class="panel-head">
          <h3>Últimas transacciones</h3>
          <button class="link" @click="router.push({ name: 'transactions' })">
            Ver todas <ArrowRight :size="15" />
          </button>
        </div>
        <RecentTransactionsTable :rows="recentTransactions" :loading="loading" />
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
.grid-kpi {
  margin-bottom: 20px;
}
.grid-main {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
}
.panel {
  padding: 22px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.panel-head h3 {
  font-size: 1.05rem;
}
.link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--primary-strong);
  font-weight: 600;
  font-size: 0.85rem;
}
html.dark .link {
  color: var(--primary);
}
.empty-chart {
  height: 300px;
  display: grid;
  place-items: center;
}

@media (max-width: 900px) {
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>
