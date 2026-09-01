<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface Props {
  columns: TableColumn[];
  // Named domain interfaces (TransactionInterface, UserInterface, ...) have no
  // index signature, so TypeScript never lets them satisfy a typed "TableRow"
  // shape here -- callers already cast rows internally (see asX() helpers in
  // consuming Views), so this stays intentionally loose.
  rows?: unknown[];
  loading?: boolean;
  hasActions?: boolean;
  emptyTitle?: string;
  emptyText?: string;
}

withDefaults(defineProps<Props>(), {
  rows: () => [],
  loading: false,
  hasActions: false,
  emptyTitle: 'Sin resultados',
  emptyText: 'No hay datos para mostrar por ahora.',
});

function asRow(row: unknown): Record<string, unknown> & { id?: number | string } {
  return row as Record<string, unknown> & { id?: number | string };
}
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ textAlign: col.align || 'left', width: col.width || 'auto' }"
          >
            {{ col.label }}
          </th>
          <th v-if="hasActions" style="text-align: right; width: 120px">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <!-- Loading skeleton -->
        <template v-if="loading">
          <tr v-for="n in 5" :key="'sk' + n" class="skeleton-row">
            <td v-for="col in columns" :key="col.key"><span class="skeleton"></span></td>
            <td v-if="hasActions"><span class="skeleton"></span></td>
          </tr>
        </template>

        <!-- Data -->
        <template v-else-if="rows.length">
          <tr v-for="(row, i) in rows" :key="asRow(row).id ?? i">
            <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
              <slot :name="'cell-' + col.key" :row="row" :value="asRow(row)[col.key]">
                {{ asRow(row)[col.key] }}
              </slot>
            </td>
            <td v-if="hasActions" style="text-align: right">
              <div class="row-actions">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Empty state -->
    <div v-if="!loading && !rows.length" class="empty">
      <div class="empty-icon"><Inbox :size="28" /></div>
      <h4>{{ emptyTitle }}</h4>
      <p class="muted">{{ emptyText }}</p>
    </div>
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

.skeleton {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty {
  text-align: center;
  padding: 48px 20px;
}
.empty-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: var(--surface-2);
  color: var(--text-soft);
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}
.empty h4 {
  font-size: 1rem;
  margin-bottom: 4px;
}
.empty p {
  font-size: 0.88rem;
}
</style>
