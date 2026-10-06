<script setup lang="ts">
import { ArrowRight, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import RecentTransactionsTable from '@/components/overview/RecentTransactionsTableComponent.vue';
import ChartGraphic from '@/components/shared/ChartGraphicComponent.vue';
import StatCard from '@/components/shared/StatCardComponent.vue';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { AuthService } from '@/services/AuthService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { AccountUtil } from '@/utils/AccountUtil.js';
import { DateRangeUtil } from '@/utils/DateRangeUtil.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';
import { TransactionUtil } from '@/utils/TransactionUtil.js';

// State
const router = useRouter();
const monthRange = DateRangeUtil.currentMonthFull();

const accounts = ref<AccountInterface[]>([]);
const activities = ref<ActivityInterface[]>([]);
const transactions = ref<TransactionInterface[]>([]);

// Computed
const currentUser = computed(() => AuthService.getCurrentUser());

const monthTransactions = computed(() =>
  TransactionUtil.filter(transactions.value, { from: monthRange.start, to: monthRange.end }),
);
const monthExpenses = computed(() =>
  monthTransactions.value.filter((transaction) => transaction.type === 'expense'),
);
const monthIncomes = computed(() =>
  monthTransactions.value.filter((transaction) => transaction.type === 'income'),
);
const monthSummary = computed(() => TransactionUtil.summarize(monthTransactions.value));

const totalBalance = computed(() =>
  AccountUtil.getTotalBalance(accounts.value, transactions.value),
);

// Doughnut: expense by activity this month
const donut = computed(() => {
  const entries = TransactionUtil.aggregateExpensesByActivity(
    monthTransactions.value,
    activities.value,
  );
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

const recentTransactions = computed(() =>
  TransactionUtil.getRows(transactions.value.slice(0, 5), accounts.value, activities.value),
);

// Lifecycle
onMounted(async () => {
  try {
    accounts.value = await AccountService.getAll();
    activities.value = await ActivityService.getAll();
    transactions.value = await TransactionService.getAll();
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo cargar el resumen',
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
        :value="FormattersUtil.formatToCOP(totalBalance)"
        :icon="Wallet"
        trend="Suma de todas tus cuentas"
      />
      <StatCard
        title="Gasto del mes"
        :value="FormattersUtil.formatToCOP(monthSummary.totalExpense)"
        :icon="TrendingDown"
        variant="expense"
        :trend="`${monthExpenses.length} movimientos`"
        :trendUp="false"
      />
      <StatCard
        title="Ingresos del mes"
        :value="FormattersUtil.formatToCOP(monthSummary.totalIncome)"
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
        <RecentTransactionsTable :rows="recentTransactions" />
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
