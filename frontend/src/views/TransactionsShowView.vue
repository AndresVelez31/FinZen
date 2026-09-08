<script setup lang="ts">
// Imports
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Filter, RotateCcw } from 'lucide-vue-next';
import TransactionsTable from '@/components/transactions/TransactionsTable.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import { TransactionService } from '@/services/TransactionService.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { ReportAnalytics } from '@/utils/ReportAnalytics.js';
import { Formatters } from '@/utils/formatters.js';
import { MONTH_OPTIONS } from '@/utils/constants.js';
import type { FilterOption } from '@/utils/constants.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';

// State
const router = useRouter();
const loading = ref(true);

const fActivity = ref<string>('');
const fAccount = ref<string>('');
const fType = ref<string>('');
const fMonth = ref<string>('');
const fFrom = ref<string>('');
const fTo = ref<string>('');

const typeOptions: FilterOption[] = [
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
];

// Computed
const activityOptions = computed<FilterOption[]>(() =>
  ActivityService.getAll().map((activity) => ({ value: String(activity.id), label: activity.name })),
);

const accountOptions = computed<FilterOption[]>(() =>
  AccountService.getAll().map((account) => ({
    value: String(account.id),
    label: `${account.name} · ${account.type}`,
  })),
);

const filtered = computed<TransactionInterface[]>(() =>
  TransactionService.filterTransactions({
    activityId: fActivity.value ? Number(fActivity.value) : undefined,
    accountId: fAccount.value ? Number(fAccount.value) : undefined,
    type: fType.value || undefined,
    month: fMonth.value || undefined,
    from: fFrom.value || undefined,
    to: fTo.value || undefined,
  }),
);

const activeFilters = computed(
  () =>
    [fActivity.value, fAccount.value, fType.value, fMonth.value, fFrom.value, fTo.value].filter(
      Boolean,
    ).length,
);

// Bar chart: expense by activity for the filtered set
const bar = computed(() => {
  const entries = ReportAnalytics.aggregateExpensesByActivity(filtered.value);
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

const hasBar = computed(() => bar.value.labels.length > 0);

const totals = computed(() => {
  const summary = ReportAnalytics.summarize(filtered.value);
  return { income: summary.totalIncome, expense: summary.totalExpense };
});

// Actions
function resetFilters() {
  fActivity.value = '';
  fAccount.value = '';
  fType.value = '';
  fMonth.value = '';
  fFrom.value = '';
  fTo.value = '';
}

function onEdit(transaction: TransactionInterface) {
  router.push({ name: 'transactions.edit', params: { id: transaction.id } });
}

async function removeTx(row: TransactionInterface) {
  const Swal = (await import('sweetalert2')).default;
  const res = await Swal.fire({
    title: '¿Eliminar transacción?',
    html: `<b>${row.description}</b><br>${Formatters.formatToCOP(row.amount)}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });
  if (res.isConfirmed) {
    TransactionService.delete(row.id);
    Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1200, showConfirmButton: false });
  }
}

// Lifecycle
onMounted(() => {
  setTimeout(() => (loading.value = false), 450);
});
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Transacciones</h2>
        <p class="muted">
          {{ filtered.length }} movimientos · Ingresos {{ Formatters.formatToCOP(totals.income) }} · Gastos
          {{ Formatters.formatToCOP(totals.expense) }}
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
          v-model="fActivity"
          :options="activityOptions"
          placeholder="Todas"
        />

        <SelectorFilter
          label="Cuenta"
          v-model="fAccount"
          :options="accountOptions"
          placeholder="Todas"
        />

        <SelectorFilter label="Tipo" v-model="fType" :options="typeOptions" placeholder="Todos" />
        <SelectorFilter label="Mes" v-model="fMonth" :options="MONTH_OPTIONS" placeholder="Todos" />
        <div class="field">
          <label>Desde</label>
          <input v-model="fFrom" type="date" class="input" />
        </div>

        <div class="field">
          <label>Hasta</label>
          <input v-model="fTo" type="date" class="input" />
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
        v-if="hasBar"
        type="bar"
        :labels="bar.labels"
        :datasets="bar.datasets"
        :height="260"
        :options="{ plugins: { legend: { display: false } } }"
      />
      <div v-else class="empty-chart">
        <p class="muted">No hay gastos que coincidan con los filtros.</p>
      </div>
    </section>

    <!-- Table -->
    <TransactionsTable :rows="filtered" :loading="loading" @edit="onEdit" @delete="removeTx" />
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
