<script setup lang="ts">
// External imports
import { Filter, Plus, RotateCcw } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Internal imports
import ChartGraphic from '@/components/shared/ChartGraphicComponent.vue';
import SelectorFilter from '@/components/shared/SelectorFilterComponent.vue';
import TransactionsTable from '@/components/transactions/TransactionsTableComponent.vue';
import { MONTH_OPTIONS, TRANSACTION_TYPE_OPTIONS } from '@/enums/constants.js';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import type { TransactionRowInterface } from '@/interfaces/TransactionRowInterface.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';
import { TransactionUtil } from '@/utils/TransactionUtil.js';

// Variables
const router = useRouter();

// Reactive variables
const transactions = ref<TransactionInterface[]>([]);
const accounts = ref<AccountInterface[]>([]);
const activities = ref<ActivityInterface[]>([]);

// Selectors
const activityOptions = computed<FilterOptionInterface[]>(() =>
  activities.value.map((activity) => ({ value: String(activity.id), label: activity.name })),
);

const accountOptions = computed<FilterOptionInterface[]>(() =>
  accounts.value.map((account) => ({
    value: String(account.id),
    label: `${account.name} · ${account.type}`,
  })),
);

const filterActivity = ref('');
const filterAccount = ref('');
const filterType = ref('');
const filterMonth = ref('');
const filterFrom = ref('');
const filterTo = ref('');

// Computed
const filteredTransactions = computed(() =>
  TransactionUtil.filterByCriteria(transactions.value, {
    activityId: filterActivity.value ? Number(filterActivity.value) : undefined,
    accountId: filterAccount.value ? Number(filterAccount.value) : undefined,
    type: filterType.value || undefined,
    month: filterMonth.value || undefined,
    from: filterFrom.value || undefined,
    to: filterTo.value || undefined,
  }),
);

const filteredRows = computed<TransactionRowInterface[]>(() =>
  TransactionUtil.attachAccountAndActivity(
    filteredTransactions.value,
    accounts.value,
    activities.value,
  ),
);

const activeFilters = computed(
  () =>
    [
      filterActivity.value,
      filterAccount.value,
      filterType.value,
      filterMonth.value,
      filterFrom.value,
      filterTo.value,
    ].filter(Boolean).length,
);

// Bar chart: expense by activity for the filtered set
const barChart = computed(() => {
  const entries = TransactionUtil.groupExpensesByActivity(
    filteredTransactions.value,
    activities.value,
  );
  return {
    labels: entries.map((entry) => entry.name),
    datasets: [
      {
        label: 'Gasto',
        data: entries.map((entry) => entry.total),
        backgroundColor: entries.map((entry) => entry.color),
        borderRadius: 8,
        maxBarThickness: 46,
      },
    ],
  };
});

const hasBarChart = computed(() => barChart.value.labels.length > 0);

const totals = computed(() => {
  const summary = TransactionUtil.summarizeIncomeAndExpense(filteredTransactions.value);
  return { income: summary.totalIncome, expense: summary.totalExpense };
});

// Actions
function resetFilters(): void {
  filterActivity.value = '';
  filterAccount.value = '';
  filterType.value = '';
  filterMonth.value = '';
  filterFrom.value = '';
  filterTo.value = '';
}

function editTransaction(transaction: TransactionRowInterface): void {
  router.push({ name: 'transactions.edit', params: { id: transaction.id } });
}

function deleteTransaction(transaction: TransactionRowInterface): void {
  Swal.fire({
    title: '¿Eliminar transacción?',
    html: `<b>${transaction.description}</b><br>${FormattersUtil.formatToCOP(transaction.amount)}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }

    TransactionService.delete(transaction.id)
      .then(() => {
        transactions.value = transactions.value.filter(
          (existingTransaction) => existingTransaction.id !== transaction.id,
        );
        Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1200, showConfirmButton: false });
      })
      .catch((error: Error) => {
        Swal.fire({
          title: 'No se pudo eliminar la transacción',
          text: error.message,
          icon: 'error',
        });
      });
  });
}

// Lifecycle
onMounted(async () => {
  try {
    transactions.value = await TransactionService.getAll();
    accounts.value = await AccountService.getAll();
    activities.value = await ActivityService.getAll();
  } catch (error) {
    await Swal.fire({
      title: 'No se pudieron cargar las transacciones',
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
        <h2 class="page-title">Transacciones</h2>
        <p class="muted">
          {{ filteredRows.length }} movimientos · Ingresos {{ FormattersUtil.formatToCOP(totals.income) }} · Gastos
          {{ FormattersUtil.formatToCOP(totals.expense) }}
        </p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'transactions.create' })">
        <Plus :size="18" /> Nueva transacción
      </button>
    </div>

    <!-- Filters -->
    <div class="card filters">
      <div class="filters-title">
        <Filter :size="17" /> <span>Filtros</span>
        <span v-if="activeFilters" class="badge badge-green">{{ activeFilters }} activos</span>
      </div>
      <div class="filters-grid">
        <SelectorFilter
          label="Actividad"
          v-model="filterActivity"
          :options="activityOptions"
          placeholder="Todas"
        />

        <SelectorFilter
          label="Cuenta"
          v-model="filterAccount"
          :options="accountOptions"
          placeholder="Todas"
        />

        <SelectorFilter label="Tipo" v-model="filterType" :options="TRANSACTION_TYPE_OPTIONS" placeholder="Todos" />
        <SelectorFilter label="Mes" v-model="filterMonth" :options="MONTH_OPTIONS" placeholder="Todos" />
        <div class="field">
          <label>Desde</label>
          <input v-model="filterFrom" type="date" class="input" />
        </div>

        <div class="field">
          <label>Hasta</label>
          <input v-model="filterTo" type="date" class="input" />
        </div>

        <button class="btn btn-ghost reset" @click="resetFilters">
          <RotateCcw :size="15" />
          Limpiar
        </button>
      </div>
    </div>

    <!-- Chart -->
    <section class="card panel">
      <div class="panel-head">
        <h3>Gasto por actividad</h3>
        <span class="badge badge-gray">Según filtros</span>
      </div>
      <ChartGraphic
        v-if="hasBarChart"
        type="bar"
        :labels="barChart.labels"
        :datasets="barChart.datasets"
        :height="260"
        :options="{ plugins: { legend: { display: false } } }"
      />
      <div v-else class="empty-chart">
        <p class="muted">No hay gastos que coincidan con los filtros.</p>
      </div>
    </section>

    <!-- Table -->
    <TransactionsTable :rows="filteredRows" @edit="editTransaction" @delete="deleteTransaction" />
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filters {
  padding: 18px 20px;
  margin-bottom: 20px;
}
.filters-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.92rem;
  margin-bottom: 14px;
  color: var(--text);
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
  align-items: end;
}
.reset {
  height: 44px;
}
.panel {
  padding: 22px;
  margin-bottom: 20px;
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
  height: 200px;
  display: grid;
  place-items: center;
}
</style>
