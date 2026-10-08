<script setup lang="ts">
// External imports
import { Inbox, ShieldCheck, User } from 'lucide-vue-next';

// Internal imports
import EmptyState from '@/components/shared/EmptyStateComponent.vue';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

// Props
const props = withDefaults(
  defineProps<{
    users: UserInterface[];
    currentUserId?: number | null;
  }>(),
  {
    currentUserId: null,
  },
);

// Emits
const emit = defineEmits<{
  changeRole: [user: UserInterface];
  toggleActive: [user: UserInterface];
}>();
</script>

<template>
  <div class="table-wrap card">
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Registro</th>
          <th class="right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <template v-if="props.users.length">
          <tr v-for="user in props.users" :key="user.id">
            <td class="c-user">
              <div class="u">
                <span class="u-avatar" :class="{ admin: user.role === 'admin' }">
                  {{ FormattersUtil.extractInitials(user.name) }}
                </span>
                <div class="u-text">
                  <div class="u-name">
                    {{ user.name }}
                    <span v-if="user.id === props.currentUserId" class="badge badge-green">
                      Tú
                    </span>
                  </div>
                  <span class="u-email-inline soft">{{ user.email }}</span>
                </div>
              </div>
            </td>
            <td class="c-email">{{ user.email }}</td>
            <td class="c-role">
              <span class="badge" :class="user.role === 'admin' ? 'badge-indigo' : 'badge-gray'">
                <component :is="user.role === 'admin' ? ShieldCheck : User" :size="12" />
                {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
              </span>
            </td>
            <td class="c-status">
              <span class="badge" :class="user.active ? 'badge-green' : 'badge-gray'">
                {{ user.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="c-date num">
              <span class="date-label soft">Registro · </span
              >{{ FormattersUtil.formatDate(user.createdAt) }}
            </td>
            <td class="right c-actions">
              <div class="user-actions">
                <button
                  class="btn btn-ghost btn-sm"
                  :disabled="user.id === props.currentUserId"
                  @click="emit('changeRole', user)"
                >
                  {{ user.role === 'admin' ? 'A usuario' : 'A admin' }}
                </button>
                <button
                  class="btn btn-sm"
                  :class="user.active ? 'btn-danger' : 'btn-ghost'"
                  :disabled="user.id === props.currentUserId"
                  @click="emit('toggleActive', user)"
                >
                  {{ user.active ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!props.users.length"
      :icon="Inbox"
      title="Sin usuarios"
      text="No hay usuarios que coincidan con el filtro."
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
.u {
  display: flex;
  align-items: center;
  gap: 12px;
}
.u-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--text-soft);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.u-avatar.admin {
  background: var(--accent);
}
.u-text {
  min-width: 0;
}
.u-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.u-email-inline,
.date-label {
  display: none;
}
.c-date {
  white-space: nowrap;
}
.user-actions {
  display: inline-flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Narrow space (phones, tablets with the sidebar): one card per user, with both actions sharing the bottom row */
@container (max-width: 760px) {
  .table,
  .table tbody {
    display: block;
  }
  .table thead,
  .c-email {
    display: none;
  }
  tbody tr {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 8px;
    padding: 16px;
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
  .c-user,
  .c-date,
  .c-actions {
    flex-basis: 100%;
  }
  .u-email-inline {
    display: block;
    font-size: 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .c-date {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .date-label {
    display: inline;
  }
  .user-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }
}
</style>
