<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';
import TableSkeleton from '@/components/shared/TableSkeleton.vue';
import EmptyState from '@/components/shared/EmptyState.vue';
import { Formatters } from '@/utils/formatters.js';
import type { TransactionRowInterface } from '@/utils/ReportAnalytics.js';

interface Props {
  rows: TransactionRowInterface[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Actividad</th>
          <th>Fecha</th>
          <th style="text-align: right">Importe</th>
        </tr>
      </thead>

      <tbody>
        <TableSkeleton v-if="loading" :columns="4" />

        <template v-else-if="rows.length">
          <tr v-for="transaction in rows" :key="transaction.id">
            <td>
              <div class="tx-desc">
                <span class="dot" :style="{ background: transaction.activityColor }"></span>
                <div>
                  <div class="tx-name">{{ transaction.description }}</div>
                  <div class="soft tx-acc">{{ transaction.accountName }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="chip badge-gray">{{ transaction.activityName }}</span>
            </td>
            <td>{{ Formatters.formatDate(transaction.date) }}</td>
            <td style="text-align: right">
              <span :class="transaction.type === 'income' ? 'amt-in' : 'amt-out'">
                {{ transaction.type === 'income' ? '+' : '−' }}{{ Formatters.formatToCOP(transaction.amount) }}
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!loading && !rows.length"
      :icon="Inbox"
      title="Sin transacciones"
      text="Crea tu primera transacción para verla aquí."
    />
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
thead th {
  text-align: left;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-soft);
  font-weight: 700;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
tbody td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  vertical-align: middle;
}
tbody tr {
  transition: background 0.15s ease;
}
tbody tr:hover {
  background: var(--surface-2);
}
tbody tr:last-child td {
  border-bottom: none;
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
</style>
