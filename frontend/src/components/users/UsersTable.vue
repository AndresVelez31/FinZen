<script setup lang="ts">
import { Inbox, ShieldCheck, User } from 'lucide-vue-next';
import TableSkeleton from '@/components/shared/TableSkeleton.vue';
import EmptyState from '@/components/shared/EmptyState.vue';
import { Formatters } from '@/utils/formatters.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';

interface Props {
  users: UserInterface[];
  loading?: boolean;
  currentUserId?: number | null;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  currentUserId: null,
});

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
          <th style="text-align: right; width: 120px">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <TableSkeleton v-if="loading" :columns="6" />

        <template v-else-if="users.length">
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="u">
                <span class="u-avatar" :class="{ admin: user.role === 'admin' }">
                  {{ Formatters.initials(user.name) }}
                </span>
                <div class="u-name">
                  {{ user.name }}
                  <span v-if="user.id === currentUserId" class="badge badge-green"> Tú </span>
                </div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.role === 'admin' ? 'badge-indigo' : 'badge-gray'">
                <component :is="user.role === 'admin' ? ShieldCheck : User" :size="12" />
                {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="user.active ? 'badge-green' : 'badge-gray'">
                {{ user.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ Formatters.formatDate(user.createdAt) }}</td>
            <td style="text-align: right">
              <div class="row-actions">
                <div class="user-actions">
                  <button
                    class="btn btn-ghost btn-sm"
                    :disabled="user.id === currentUserId"
                    @click="emit('changeRole', user)"
                  >
                    {{ user.role === 'admin' ? 'A usuario' : 'A admin' }}
                  </button>
                  <button
                    class="btn btn-ghost btn-sm"
                    :disabled="user.id === currentUserId"
                    @click="emit('toggleActive', user)"
                  >
                    {{ user.active ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <EmptyState
      v-if="!loading && !users.length"
      :icon="Inbox"
      title="Sin usuarios"
      text="No hay usuarios que coincidan con el filtro."
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
.u-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}
.user-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
