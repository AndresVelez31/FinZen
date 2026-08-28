<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Wallet, TrendingDown, TrendingUp, Plus, ArrowRight } from 'lucide-vue-next';
import StatCard from '@/components/shared/StatCard.vue';
import GraficoChart from '@/components/shared/GraficoChart.vue';
import TablaGenerica from '@/components/shared/TablaGenerica.vue';
import {
  myTransactions,
  currentUser,
  totalBalance,
  formatMoney,
  formatDate,
  activityById,
  accountById,
  monthKey,
} from '@/store';

const router = useRouter();
const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 500));

const nowKey = monthKey(new Date());

const monthTx = computed(() => myTransactions.value.filter((t) => monthKey(t.date) === nowKey));
const monthExpense = computed(() =>
  monthTx.value.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
);
const monthIncome = computed(() =>
  monthTx.value.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
);
const balance = computed(() => totalBalance());

// Doughnut: expense by activity this month
const donut = computed(() => {
  const map = {};
  monthTx.value
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const ac = activityById(t.activityId);
      const name = ac ? ac.name : 'Otros';
      map[name] = map[name] || { total: 0, color: ac?.color || '#94a3b8' };
      map[name].total += t.amount;
    });
  const entries = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  return {
    labels: entries.map((e) => e[0]),
    datasets: [
      {
        data: entries.map((e) => e[1].total),
        backgroundColor: entries.map((e) => e[1].color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});
const hasDonut = computed(() => donut.value.labels.length > 0);

const recent = computed(() => myTransactions.value.slice(0, 5));
const columns = [
  { key: 'description', label: 'Descripción' },
  { key: 'activityId', label: 'Actividad' },
  { key: 'date', label: 'Fecha' },
  { key: 'amount', label: 'Importe', align: 'right' },
];
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
        label="Balance total"
        :value="formatMoney(balance)"
        :icon="Wallet"
        accent="var(--primary)"
        trend="Suma de todas tus cuentas"
      />
      <StatCard
        label="Gasto del mes"
        :value="formatMoney(monthExpense)"
        :icon="TrendingDown"
        accent="var(--danger)"
        :trend="`${monthTx.filter((t) => t.type === 'expense').length} movimientos`"
        :trendUp="false"
      />
      <StatCard
        label="Ingresos del mes"
        :value="formatMoney(monthIncome)"
        :icon="TrendingUp"
        accent="var(--info)"
        :trend="`${monthTx.filter((t) => t.type === 'income').length} movimientos`"
      />
    </div>

    <!-- Charts + recent -->
    <div class="grid-main">
      <section class="card panel">
        <div class="panel-head">
          <h3>Gasto por actividad</h3>
          <span class="badge badge-gray">Mes actual</span>
        </div>
        <GraficoChart
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
        <TablaGenerica
          :columns="columns"
          :rows="recent"
          :loading="loading"
          emptyTitle="Sin transacciones"
          emptyText="Crea tu primera transacción para verla aquí."
        >
          <template #cell-description="{ row }">
            <div class="tx-desc">
              <span
                class="dot"
                :style="{ background: activityById(row.activityId)?.color || '#94a3b8' }"
              ></span>
              <div>
                <div class="tx-name">{{ row.description }}</div>
                <div class="soft tx-acc">{{ accountById(row.accountId)?.bank }}</div>
              </div>
            </div>
          </template>
          <template #cell-activityId="{ value }">
            <span class="chip badge-gray">{{ activityById(value)?.name || '—' }}</span>
          </template>
          <template #cell-date="{ value }">{{ formatDate(value) }}</template>
          <template #cell-amount="{ row }">
            <span :class="row.type === 'income' ? 'amt-in' : 'amt-out'">
              {{ row.type === 'income' ? '+' : '−' }}{{ formatMoney(row.amount) }}
            </span>
          </template>
        </TablaGenerica>
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
