<script setup lang="ts">
import { Inbox, Pencil, Trash2 } from 'lucide-vue-next';
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

const emit = defineEmits<{
  edit: [transaction: TransactionRowInterface];
  delete: [transaction: TransactionRowInterface];
}>();
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Actividad</th>
          <th>Cuenta</th>
          <th>Fecha</th>
          <th>Tipo</th>
          <th style="text-align: right">Importe</th>
          <th style="text-align: right; width: 120px">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <TableSkeleton v-if="loading" :columns="7" />

        <template v-else-if="rows.length">
          <tr v-for="transaction in rows" :key="transaction.id">
            <td>
              <div class="tx-desc">
                <span class="dot" :style="{ background: transaction.activityColor }"></span>
                <span class="tx-name">{{ transaction.description }}</span>
              </div>
            </td>
            <td>
              <span class="chip badge-gray">{{ transaction.activityName }}</span>
            </td>
            <td>{{ transaction.accountName }}</td>
            <td>{{ Formatters.formatDate(transaction.date) }}</td>
            <td>
              <span class="badge" :class="transaction.type === 'income' ? 'badge-green' : 'badge-red'">
                {{ transaction.type === 'income' ? 'Ingreso' : 'Gasto' }}
              </span>
            </td>
            <td style="text-align: right">
              <span :class="transaction.type === 'income' ? 'amt-in' : 'amt-out'">
                {{ transaction.type === 'income' ? '+' : '−' }}{{ Formatters.formatToCOP(transaction.amount) }}
              </span>
            </td>
            <td style="text-align: right">
              <div class="row-actions">
                <div>
                  <button
                    class="btn btn-ghost btn-icon"
                    @click="emit('edit', transaction)"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <Pencil :size="15" />
                  </button>
                  <button
                    class="btn btn-danger btn-icon"
                    @click="emit('delete', transaction)"
                    aria-label="Eliminar"
                    title="Eliminar"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!loading && !rows.length"
      :icon="Inbox"
      title="Sin transacciones"
      text="Ajusta los filtros o crea una nueva transacción."
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
.row-actions {
  display: inline-flex;
  gap: 6px;
  justify-content: flex-end;
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
