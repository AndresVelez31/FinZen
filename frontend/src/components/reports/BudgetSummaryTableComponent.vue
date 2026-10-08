<script setup lang="ts">
// External imports
import { Inbox } from 'lucide-vue-next';

// Internal imports
import EmptyState from '@/components/shared/EmptyStateComponent.vue';
import type { BudgetVsActualInterface } from '@/interfaces/BudgetVsActualInterface.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

// Props
const props = defineProps<{
  rows: BudgetVsActualInterface[];
}>();
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th>Actividad</th>
          <th class="right">Presupuesto</th>
          <th class="right">Gasto real</th>
          <th class="right">Diferencia</th>
        </tr>
      </thead>

      <tbody>
        <template v-if="props.rows.length">
          <tr v-for="row in props.rows" :key="row.activityId">
            <td class="c-name">
              <div class="rn">
                <span class="dot" :style="{ background: row.color }"></span>{{ row.name }}
              </div>
            </td>
            <td class="right num" data-label="Presupuesto">
              {{ FormattersUtil.formatToCOP(row.budget) }}
            </td>
            <td class="right num" data-label="Gasto real">
              {{ FormattersUtil.formatToCOP(row.spent) }}
            </td>
            <td class="right num" data-label="Diferencia">
              <span :class="row.diff >= 0 ? 'pos' : 'neg'">
                {{ row.diff >= 0 ? '+' : '' }}{{ FormattersUtil.formatToCOP(row.diff) }}
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!props.rows.length"
      :icon="Inbox"
      title="Sin datos"
      text="No hay actividades de gasto para este periodo."
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
.rn {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 600;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.pos {
  color: var(--primary-strong);
  font-weight: 700;
}
html.dark .pos {
  color: var(--primary);
}
.neg {
  color: var(--danger);
  font-weight: 700;
}

/* Narrow space (phones, tablets with the sidebar): the activity on top and its three figures side by side, each with its label */
@container (max-width: 540px) {
  .table,
  .table tbody {
    display: block;
  }
  .table thead {
    display: none;
  }
  tbody tr {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  tbody tr:last-child {
    border-bottom: none;
  }
  tbody td {
    padding: 0;
    border: none;
    text-align: left;
    font-size: 0.85rem;
  }
  .c-name {
    grid-column: 1 / -1;
  }
  td[data-label]::before {
    content: attr(data-label);
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-soft);
    margin-bottom: 2px;
  }
}
</style>
