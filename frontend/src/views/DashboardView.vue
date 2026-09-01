<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Wallet, TrendingDown, TrendingUp, Plus, ArrowRight } from 'lucide-vue-next';
import StatCard from '@/components/shared/StatCard.vue';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import GenericTable from '@/components/shared/GenericTable.vue';
import type { TableColumn } from '@/components/shared/GenericTable.vue';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { UserService } from '@/services/UserService.js';
import { formatToCOP, formatDate } from '@/utils/formatters.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

const router = useRouter();
const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 500));

const currentUser = computed(() => UserService.getCurrentUser());
const transactions = computed(() => TransactionService.getTransactions());

const currentMonth = new Date().toISOString().slice(0, 7);
const monthTransactions = computed(() =>
  transactions.value.filter((transaction) => transaction.date.slice(0, 7) === currentMonth),
);

const monthExpenses = computed(() => monthTransactions.value.filter((transaction) => transaction.type === 'expense'));
const monthIncomes = computed(() => monthTransactions.value.filter((transaction) => transaction.type === 'income'));

const monthExpenseTotal = computed(() =>
  monthExpenses.value.reduce((total, transaction) => total + transaction.amount, 0),
);
const monthIncomeTotal = computed(() =>
  monthIncomes.value.reduce((total, transaction) => total + transaction.amount, 0),
);

const totalBalance = computed(() => AccountService.getTotalBalance());

// Doughnut: expense by activity this month
const donut = computed(() => {
  const totals = new Map<string, { total: number; color: string }>();

  monthExpenses.value.forEach((transaction) => {
    const activity = ActivityService.getActivityById(transaction.activityId);
    const name = activity ? activity.name : 'Otros';
    const entry = totals.get(name) ?? { total: 0, color: activity?.color ?? '#94a3b8' };
    entry.total += transaction.amount;
    totals.set(name, entry);
  });

  const entries = [...totals.entries()].sort((a, b) => b[1].total - a[1].total);

  return {
    labels: entries.map(([name]) => name),
    datasets: [
      {
        data: entries.map(([, entry]) => entry.total),
        backgroundColor: entries.map(([, entry]) => entry.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});
const hasDonut = computed(() => donut.value.labels.length > 0);

const recentTransactions = computed(() => transactions.value.slice(0, 5));
const columns: TableColumn[] = [
  { key: 'description', label: 'Descripción' },
  { key: 'activityId', label: 'Actividad' },
  { key: 'date', label: 'Fecha' },
  { key: 'amount', label: 'Importe', align: 'right' },
];

// Helper para tipar la fila directamente en el script (mismo patrón que otras vistas)
function asTransaction(row: unknown): TransactionInterface {
  return row as TransactionInterface;
}
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Hola, {{ currentUser?.name?.split(' ')[0] }}</h2>
        <p class="muted">Este es el resumen de tus finanzas de este mes.</p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'transaction-new' })">
        <Plus :size="18" /> Nueva transacción
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid-kpi">
      <StatCard
        title="Balance total"
        :value="formatToCOP(totalBalance)"
        :icon="Wallet"
        trend="Suma de todas tus cuentas"
      />
      <StatCard
        title="Gasto del mes"
        :value="formatToCOP(monthExpenseTotal)"
        :icon="TrendingDown"
        variant="expense"
        :trend="`${monthExpenses.length} movimientos`"
        :trendUp="false"
      />
      <StatCard
        title="Ingresos del mes"
        :value="formatToCOP(monthIncomeTotal)"
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
        <GenericTable
          :columns="columns"
          :rows="recentTransactions"
          :loading="loading"
          emptyTitle="Sin transacciones"
          emptyText="Crea tu primera transacción para verla aquí."
        >
          <template #cell-description="{ row }">
            <div class="tx-desc">
              <span
                class="dot"
                :style="{ background: ActivityService.getActivityById(asTransaction(row).activityId)?.color ?? '#94a3b8' }"
              ></span>
              <div>
                <div class="tx-name">{{ asTransaction(row).description }}</div>
                <div class="soft tx-acc">
                  {{ AccountService.getAccountById(asTransaction(row).accountId)?.name }}
                </div>
              </div>
            </div>
          </template>
          <template #cell-activityId="{ value }">
            <span class="chip badge-gray">{{ ActivityService.getActivityById(Number(value))?.name ?? '—' }}</span>
          </template>
          <template #cell-date="{ value }">{{ formatDate(String(value)) }}</template>
          <template #cell-amount="{ row }">
            <span :class="asTransaction(row).type === 'income' ? 'amt-in' : 'amt-out'">
              {{ asTransaction(row).type === 'income' ? '+' : '−' }}{{ formatToCOP(asTransaction(row).amount) }}
            </span>
          </template>
        </GenericTable>
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
.tx-desc {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tx-name {
  font-weight: 600;
}
.tx-acc {
  font-size: 0.76rem;
}
.amt-in {
  color: var(--primary-strong);
  font-weight: 700;
}
html.dark .amt-in {
  color: var(--primary);
}
.amt-out {
  color: var(--text);
  font-weight: 700;
}

@media (max-width: 900px) {
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>
