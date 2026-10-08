<script setup lang="ts">
// External imports
import { Plus } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Internal imports
import ChartGraphic from '@/components/shared/ChartGraphicComponent.vue';
import PaginatedList from '@/components/shared/PaginatedListComponent.vue';
import TransactionFilters from '@/components/transactions/TransactionFiltersComponent.vue';
import TransactionsTable from '@/components/transactions/TransactionsTableComponent.vue';
import { EMPTY_TRANSACTION_FILTERS } from '@/enums/constants.js';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { FilterOptionInterface } from '@/interfaces/FilterOptionInterface.js';
import type { TransactionFiltersInterface } from '@/interfaces/TransactionFiltersInterface.js';
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

const filters = ref<TransactionFiltersInterface>({ ...EMPTY_TRANSACTION_FILTERS });

// Computed
const filteredTransactions = computed(() =>
  TransactionUtil.filterByCriteria(transactions.value, {
    activityId: filters.value.activityId ? Number(filters.value.activityId) : undefined,
    accountId: filters.value.accountId ? Number(filters.value.accountId) : undefined,
    type: filters.value.type || undefined,
    month: filters.value.month || undefined,
    from: filters.value.from || undefined,
    to: filters.value.to || undefined,
  }),
);

const filteredTransactionRows = computed<TransactionRowInterface[]>(() =>
  TransactionUtil.attachAccountAndActivity(
    filteredTransactions.value,
    accounts.value,
    activities.value,
  ),
);

// Changes with any filter; used as the list's key so a new filter starts again from page 1.
const filterSelection = computed(() => Object.values(filters.value).join('|'));

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
function editTransaction(transaction: TransactionRowInterface): void {
  router.push({ name: 'transactions.edit', params: { id: transaction.id } });
}

async function deleteTransaction(transaction: TransactionRowInterface): Promise<void> {
  const result = await Swal.fire({
    title: '¿Eliminar transacción?',
    html: `<b>${transaction.description}</b><br>${FormattersUtil.formatToCOP(transaction.amount)}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await TransactionService.delete(transaction.id);
    transactions.value = transactions.value.filter(
      (existingTransaction) => existingTransaction.id !== transaction.id,
    );
    await Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1200, showConfirmButton: false });
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo eliminar la transacción',
      text: (error as Error).message,
      icon: 'error',
    });
  }
}

// Lifecycle
onMounted(async () => {
  try {
    transactions.value = await TransactionService.getAllByUserId();
    accounts.value = await AccountService.getAllByUserId();
    activities.value = await ActivityService.getAllByUserId();
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
    <div class="page-head">
      <div>
        <h2 class="page-title">Transacciones</h2>
        <p class="summary">
          <span class="muted">{{ filteredTransactionRows.length }} movimientos</span>
          <span class="summary-pill in num">+{{ FormattersUtil.formatToCOP(totals.income) }}</span>
          <span class="summary-pill out num">−{{ FormattersUtil.formatToCOP(totals.expense) }}</span>
        </p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'transactions.create' })">
        <Plus :size="18" /> Nueva transacción
      </button>
    </div>

    <!-- Filters -->
    <TransactionFilters
      v-model="filters"
      :activity-options="activityOptions"
      :account-options="accountOptions"
    />

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
    <PaginatedList
      :key="filterSelection"
      v-slot="{ items: pagedTransactions }"
      :items="filteredTransactionRows"
      :page-size="10"
      item-label="movimientos"
    >
      <TransactionsTable
        :rows="pagedTransactions"
        @edit="editTransaction"
        @delete="deleteTransaction"
      />
    </PaginatedList>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.9rem;
}
.summary-pill {
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.82rem;
}
.summary-pill.in {
  background: color-mix(in srgb, var(--primary) 13%, transparent);
  color: var(--primary-strong);
}
html.dark .summary-pill.in {
  color: var(--primary);
}
.summary-pill.out {
  background: color-mix(in srgb, var(--danger) 11%, transparent);
  color: var(--danger);
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
@media (max-width: 560px) {
  .panel {
    padding: 18px 16px;
  }
}
</style>
