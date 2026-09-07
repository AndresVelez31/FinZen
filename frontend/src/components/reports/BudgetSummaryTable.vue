<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';
import EmptyState from '@/components/shared/EmptyState.vue';
import { Formatters } from '@/utils/formatters.js';

export interface SummaryRow {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
  diff: number;
}

interface Props {
  rows: SummaryRow[];
}

defineProps<Props>();
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th>Actividad</th>
          <th style="text-align: right">Presupuesto</th>
          <th style="text-align: right">Gasto real</th>
          <th style="text-align: right">Diferencia</th>
        </tr>
      </thead>

      <tbody>
        <template v-if="rows.length">
          <tr v-for="row in rows" :key="row.id">
            <td>
              <div class="rn">
                <span class="dot" :style="{ background: row.color }"></span
                >{{ row.name }}
              </div>
            </td>
            <td style="text-align: right">{{ Formatters.formatToCOP(row.budget) }}</td>
            <td style="text-align: right">{{ Formatters.formatToCOP(row.spent) }}</td>
            <td style="text-align: right">
              <span :class="row.diff >= 0 ? 'pos' : 'neg'">
                {{ row.diff >= 0 ? '+' : '' }}{{ Formatters.formatToCOP(row.diff) }}
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!rows.length"
      :icon="Inbox"
      title="Sin datos"
      text="No hay actividades de gasto para este periodo."
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
</style>
