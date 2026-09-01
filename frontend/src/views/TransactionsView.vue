<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Pencil, Trash2, Filter, RotateCcw } from 'lucide-vue-next';
import GenericTable from '@/components/shared/GenericTable.vue';
import SelectorFiltro from '@/components/shared/SelectorFilter.vue';
import ChartGraphic from '@/components/shared/ChartGraphic.vue';
import { TransactionService } from '@/services/TransactionService.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { formatToCOP, formatDate } from '@/utils/formatters.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';

const router = useRouter();
const loading = ref(true);

onMounted(() => {
  setTimeout(() => (loading.value = false), 450);
});

const fActivity = ref<string>('');
const fAccount = ref<string>('');
const fType = ref<string>('');
const fMonth = ref<string>('');
const fFrom = ref<string>('');
const fTo = ref<string>('');

const activityOptions = computed<{ value: string; label: string }[]>(() =>
  ActivityService.getActivities().map((a) => ({ value: String(a.id), label: a.name })),
);

const accountOptions = computed<{ value: string; label: string }[]>(() =>
  AccountService.getAccounts().map((a) => ({
    value: String(a.id),
    label: `${a.name} · ${a.type}`,
  })),
);

const typeOptions = [
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
];

const monthOptions = [
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

const filtered = computed<TransactionInterface[]>(() =>
  TransactionService.getTransactions().filter((t: TransactionInterface) => {
    if (fActivity.value && String(t.activityId) !== fActivity.value) return false;
    if (fAccount.value && String(t.accountId) !== fAccount.value) return false;
    if (fType.value && t.type !== fType.value) return false;
    if (fMonth.value && t.date.slice(5, 7) !== fMonth.value) return false;
    if (fFrom.value && t.date < fFrom.value) return false;
    if (fTo.value && t.date > fTo.value) return false;
    return true;
  }),
);

function resetFilters() {
  fActivity.value = '';
  fAccount.value = '';
  fType.value = '';
  fMonth.value = '';
  fFrom.value = '';
  fTo.value = '';
}

const activeFilters = computed(
  () =>
    [fActivity.value, fAccount.value, fType.value, fMonth.value, fFrom.value, fTo.value].filter(
      Boolean,
    ).length,
);

// Bar chart: expense by activity for the filtered set
const bar = computed(() => {
  const map: Record<string, { total: number; color: string }> = {};
  filtered.value
    .filter((t: TransactionInterface) => t.type === 'expense')
    .forEach((t: TransactionInterface) => {
      const ac = ActivityService.getActivityById(t.activityId);
      const name = ac ? ac.name : 'Otros';
      if (!map[name]) {
        map[name] = { total: 0, color: ac?.color || '#94a3b8' };
      }
      map[name].total += t.amount;
    });

  const entries = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  return {
    labels: entries.map((e) => e[0]),
    datasets: [
      {
        label: 'Gasto',
        data: entries.map((e) => e[1].total),
        backgroundColor: entries.map((e) => e[1].color),
        borderRadius: 8,
        maxBarThickness: 46,
      },
    ],
  };
});

const hasBar = computed(() => bar.value.labels.length > 0);

const totals = computed(() => {
  const income = filtered.value
    .filter((t: TransactionInterface) => t.type === 'income')
    .reduce((s: number, t: TransactionInterface) => s + t.amount, 0);
  const expense = filtered.value
    .filter((t: TransactionInterface) => t.type === 'expense')
    .reduce((s: number, t: TransactionInterface) => s + t.amount, 0);
  return { income, expense };
});

const columns = [
  { key: 'description', label: 'Descripción' },
  { key: 'activityId', label: 'Actividad' },
  { key: 'accountId', label: 'Cuenta' },
  { key: 'date', label: 'Fecha' },
  { key: 'type', label: 'Tipo' },
  { key: 'amount', label: 'Importe', align: 'right' },
];

function asTx(row: unknown): TransactionInterface {
  return row as TransactionInterface;
}

function getActivity(id: number) {
  return ActivityService.getActivityById(id);
}

function getAccount(id: number) {
  return AccountService.getAccountById(id);
}

async function removeTx(row: TransactionInterface) {
  const Swal = (await import('sweetalert2')).default;
  const res = await Swal.fire({
    title: '¿Eliminar transacción?',
    html: `<b>${row.description}</b><br>${formatToCOP(row.amount)}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });
  if (res.isConfirmed) {
    TransactionService.deleteTransaction(row.id);
    Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1200, showConfirmButton: false });
  }
}
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Transacciones</h2>
        <p class="muted">
          {{ filtered.length }} movimientos · Ingresos {{ formatToCOP(totals.income) }} · Gastos
          {{ formatToCOP(totals.expense) }}
        </p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'transaction-new' })">
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
        <SelectorFilter label="Mes" v-model="fMonth" :options="monthOptions" placeholder="Todos" />
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
    <TablaGenerica
      :columns="columns"
      :rows="filtered"
      :loading="loading"
      :hasActions="true"
      emptyTitle="Sin transacciones"
      emptyText="Ajusta los filtros o crea una nueva transacción."
    >
      <template #cell-description="{ row }">
        <div class="tx-desc" v-if="row">
          <span
            class="dot"
            :style="{ background: getActivity(asTx(row).activityId)?.color || '#94a3b8' }"
          ></span>
          <span class="tx-name">{{ asTx(row).description }}</span>
        </div>
      </template>

      <template #cell-activityId="{ value }">
        <span class="chip badge-gray">{{ getActivity(Number(value))?.name || '—' }}</span>
      </template>

      <template #cell-accountId="{ value }">
        {{ getAccount(Number(value))?.name || '—' }}
      </template>

      <template #cell-date="{ value }">
        {{ formatDate(String(value)) }}
      </template>

      <template #cell-type="{ value }">
        <span class="badge" :class="value === 'income' ? 'badge-green' : 'badge-red'">
          {{ value === 'income' ? 'Ingreso' : 'Gasto' }}
        </span>
      </template>

      <template #cell-amount="{ row }">
        <span v-if="row" :class="asTx(row).type === 'income' ? 'amt-in' : 'amt-out'">
          {{ asTx(row).type === 'income' ? '+' : '−' }}{{ formatToCOP(asTx(row).amount) }}
        </span>
      </template>

      <template #actions="{ row }">
        <div v-if="row">
          <button
            class="btn btn-ghost btn-icon"
            @click="router.push({ name: 'transaction-edit', params: { id: asTx(row).id } })"
            aria-label="Editar"
            title="Editar"
          >
            <Pencil :size="15" />
          </button>
          <button
            class="btn btn-danger btn-icon"
            @click="removeTx(asTx(row))"
            aria-label="Eliminar"
            title="Eliminar"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </template>
    </TablaGenerica>
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
.amt-in {
  color: var(--primary-strong);
  font-weight: 700;
}
html.dark .amt-in {
  color: var(--primary);
}
.amt-out {
  font-weight: 700;
}
</style>
