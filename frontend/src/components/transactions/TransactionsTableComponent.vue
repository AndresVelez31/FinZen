<script setup lang="ts">
// External imports
import { Inbox, Pencil, Trash2 } from 'lucide-vue-next';

// Internal imports
import EmptyState from '@/components/shared/EmptyStateComponent.vue';
import type { TransactionRowInterface } from '@/interfaces/TransactionRowInterface.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

// Props
const props = defineProps<{
  rows: TransactionRowInterface[];
}>();

// Emits
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
          <th class="right">Importe</th>
          <th class="right actions-col">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <template v-if="props.rows.length">
          <tr v-for="transaction in props.rows" :key="transaction.id">
            <td class="c-desc">
              <div class="tx-desc">
                <span class="dot" :style="{ background: transaction.activityColor }"></span>
                <div class="tx-text">
                  <span class="tx-name">{{ transaction.description }}</span>
                  <!-- On phones the other columns fold into this line -->
                  <span class="tx-meta soft">
                    {{ transaction.activityName }} · {{ transaction.accountName }} ·
                    {{ FormattersUtil.formatShortDate(transaction.date) }}
                  </span>
                </div>
              </div>
            </td>
            <td class="c-wide">
              <span class="chip badge-gray">{{ transaction.activityName }}</span>
            </td>
            <td class="c-wide">{{ transaction.accountName }}</td>
            <td class="c-wide num nowrap">{{ FormattersUtil.formatDate(transaction.date) }}</td>
            <td class="c-wide">
              <span
                class="badge"
                :class="transaction.type === 'income' ? 'badge-green' : 'badge-red'"
              >
                {{ transaction.type === 'income' ? 'Ingreso' : 'Gasto' }}
              </span>
            </td>
            <td class="right c-amount">
              <span
                class="num nowrap"
                :class="transaction.type === 'income' ? 'amt-in' : 'amt-out'"
              >
                {{ transaction.type === 'income' ? '+' : '−'
                }}{{ FormattersUtil.formatToCOP(transaction.amount) }}
              </span>
            </td>
            <td class="right c-actions">
              <div class="action-pair">
                <button
                  class="btn btn-ghost btn-icon"
                  @click="emit('edit', transaction)"
                  :aria-label="`Editar ${transaction.description}`"
                  title="Editar"
                >
                  <Pencil :size="15" />
                </button>
                <button
                  class="btn btn-danger btn-icon"
                  @click="emit('delete', transaction)"
                  :aria-label="`Eliminar ${transaction.description}`"
                  title="Eliminar"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!props.rows.length"
      :icon="Inbox"
      title="Sin transacciones"
      text="Ajusta los filtros o crea una nueva transacción."
    />
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  container-type: inline-size;
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
.right {
  text-align: right;
}
.nowrap {
  white-space: nowrap;
}
.actions-col {
  width: 120px;
}
.tx-desc {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tx-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tx-meta {
  display: none;
  font-size: 0.78rem;
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

/* Narrow space (phones, tablets with the sidebar): each transaction becomes a two-column card instead of a scrolling table */
@container (max-width: 820px) {
  .table,
  .table tbody {
    display: block;
  }
  .table thead,
  .c-wide {
    display: none;
  }
  tbody tr {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'desc amount'
      'desc actions';
    gap: 6px 14px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  tbody tr:last-child {
    border-bottom: none;
  }
  tbody tr:hover {
    background: transparent;
  }
  tbody td {
    padding: 0;
    border: none;
  }
  .c-desc {
    grid-area: desc;
    align-self: center;
  }
  .tx-desc {
    align-items: flex-start;
  }
  .dot {
    margin-top: 7px;
  }
  .tx-meta {
    display: block;
    margin-top: 2px;
  }
  .c-amount {
    grid-area: amount;
  }
  .c-actions {
    grid-area: actions;
  }
}
</style>
