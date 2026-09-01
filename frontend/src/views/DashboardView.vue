<script setup lang="ts">
import { computed } from 'vue';
import { Wallet, TrendingDown, TrendingUp, List } from 'lucide-vue-next';

import StatCard from '@/components/shared/StatCard.vue';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import GenericTable from '@/components/shared/GenericTable.vue';
import { AccountService } from '@/services/AccountService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { UserService } from '@/services/UserService.js';

import { formatToCOP, formatDate } from '@/utils/formatters.js';

const currentUser = computed(() => UserService.getCurrentUser());

const transactions = computed(() => TransactionService.getTransactions());

const currentMonth = new Date().toISOString().slice(0, 7);

const monthTransactions = computed(() =>
  transactions.value.filter((transaction) => transaction.date.slice(0, 7) === currentMonth),
);

const totalBalance = computed(() => AccountService.getTotalBalance());

const monthlyIncome = computed(() =>
  monthTransactions.value
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0),
);

const monthlyExpenses = computed(() =>
  monthTransactions.value
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0),
);

const transactionCount = computed(() => monthTransactions.value.length);

const recentTransactions = computed(() => transactions.value.slice(0, 5));

const lastSixMonths = computed(() => {
  const months = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const label = date.toLocaleDateString('es-CO', {
      month: 'short',
    });

    months.push({
      key,
      label,
    });
  }

  return months;
});

const expenseTrend = computed(() => {
  const values = lastSixMonths.value.map((month) => {
    return transactions.value
      .filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.date.slice(0, 7) === month.key,
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
  });

  return {
    labels: lastSixMonths.value.map((month) => month.label),
    datasets: [
      {
        label: 'Gastos',
        data: values,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };
});

const hasTransactions = computed(() => transactions.value.length > 0);

const transactionColumns = [
  { key: 'description', label: 'Descripción' },
  { key: 'date', label: 'Fecha' },
  { key: 'type', label: 'Tipo' },
  { key: 'amount', label: 'Valor', align: 'right' },
];
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Hola, {{ currentUser?.name?.split(' ')[0] }}</h2>

        <p class="muted">Este es el resumen de tus finanzas de este mes.</p>
      </div>
    </div>

    <div class="grid-kpi">
      <StatCard title="Balance total" :value="formatToCOP(totalBalance)" :icon="Wallet" />

      <StatCard
        title="Ingresos del mes"
        :value="formatToCOP(monthlyIncome)"
        :icon="TrendingUp"
        variant="income"
      />

      <StatCard
        title="Gastos del mes"
        :value="formatToCOP(monthlyExpenses)"
        :icon="TrendingDown"
        variant="expense"
      />

      <StatCard title="Transacciones del mes" :value="String(transactionCount)" :icon="List" />
    </div>
    <div v-if="hasTransactions" class="dashboard-grid">
      <section class="card panel">
        <div class="panel-head">
          <div>
            <h3>Tendencia de gastos</h3>
            <p class="muted">Últimos 6 meses</p>
          </div>
        </div>

        <ChartGraphic
          type="line"
          :labels="expenseTrend.labels"
          :datasets="expenseTrend.datasets"
          :height="300"
        />
      </section>

      <section class="recent-section">
        <div class="panel-head">
          <div>
            <h3>Últimas transacciones</h3>
            <p class="muted">Tus 5 movimientos más recientes</p>
          </div>
        </div>

        <GenericTable
          :columns="transactionColumns"
          :rows="recentTransactions"
          emptyTitle="Sin transacciones"
          emptyText="Aún no tienes movimientos registrados."
        >
          <template #cell-date="{ value }">
            {{ formatDate(String(value)) }}
          </template>

          <template #cell-type="{ value }">
            <span class="badge" :class="value === 'income' ? 'badge-green' : 'badge-gray'">
              {{ value === 'income' ? 'Ingreso' : value === 'expense' ? 'Gasto' : 'Ahorro' }}
            </span>
          </template>

          <template #cell-amount="{ row }">
            <strong :class="row.type === 'income' ? 'amount-income' : 'amount-expense'">
              {{ row.type === 'income' ? '+' : '-' }}
              {{ formatToCOP(Number(row.amount)) }}
            </strong>
          </template>
        </GenericTable>
      </section>
    </div>

    <div v-else class="card empty-dashboard">
      <List :size="32" />

      <h3>Aún no tienes transacciones</h3>

      <p class="muted">
        Registra tu primera transacción para comenzar a ver estadísticas y tendencias.
      </p>
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

.welcome-card {
  padding: 24px;
}

.welcome-card h3 {
  margin-bottom: 6px;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
}

.info-value {
  font-weight: 600;
}

@media (max-width: 700px) {
  .user-info {
    grid-template-columns: 1fr;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.panel {
  padding: 22px;
}

.panel-head {
  margin-bottom: 18px;
}

.panel-head h3 {
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.recent-section {
  min-width: 0;
}

.amount-income {
  color: var(--primary-strong);
}

.amount-expense {
  color: var(--danger);
}

.empty-dashboard {
  margin-top: 20px;
  padding: 50px 20px;
  text-align: center;
}

.empty-dashboard h3 {
  margin-top: 12px;
  margin-bottom: 6px;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
