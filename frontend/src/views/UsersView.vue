<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ShieldCheck, User, Users as UsersIcon } from 'lucide-vue-next';
import TablaGenerica from '@/components/shared/TablaGenerica.vue';
import SelectorFiltro from '@/components/shared/SelectorFiltro.vue';
import StatCard from '@/components/shared/StatCard.vue';
import { UserService } from '@/services/UserService.js';
import { formatDate } from '@/utils/formatters.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';

const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 450));

const fRole = ref('');
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

const currentUser = computed(() => UserService.getCurrentUser());

const rows = computed(() =>
  UserService.getUsers().filter((u) => (fRole.value ? u.role === fRole.value : true)),
);

const stats = computed(() => {
  const users = UserService.getUsers();
  return {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
  };
});

const columns = [
  { key: 'name', label: 'Usuario' },
  { key: 'role', label: 'Rol' },
  { key: 'createdAt', label: 'Registro' },
];

function initials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

// Helper para tipar la fila directamente en el script
function asUser(row: unknown): UserInterface {
  return row as UserInterface;
}

async function changeRole(u: UserInterface) {
  const Swal = (await import('sweetalert2')).default;
  const newRole = u.role === 'admin' ? 'user' : 'admin';
  const res = await Swal.fire({
    title: 'Cambiar rol',
    html: `Cambiar a <b>${u.name}</b> a rol <b>${newRole === 'admin' ? 'Administrador' : 'Usuario'}</b>.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#94a3b8',
  });
  if (res.isConfirmed) {
    UserService.updateUserRole(u.id, newRole);
    Swal.fire({ title: 'Rol actualizado', icon: 'success', timer: 1100, showConfirmButton: false });
  }
}
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Usuarios</h2>
        <p class="muted">Administra los usuarios registrados en la plataforma.</p>
      </div>
    </div>

    <div class="grid-kpi mb">
      <StatCard
        label="Usuarios totales"
        :value="String(stats.total)"
        :icon="UsersIcon"
        accent="var(--accent)"
      />
      <StatCard
        label="Administradores"
        :value="String(stats.admins)"
        :icon="ShieldCheck"
        accent="var(--primary)"
      />
    </div>

    <div class="card toolbar">
      <SelectorFiltro
        label="Filtrar por rol"
        v-model="fRole"
        :options="roleOptions"
        placeholder="Todos los roles"
      />
    </div>

    <TablaGenerica
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :hasActions="true"
      emptyTitle="Sin usuarios"
      emptyText="No hay usuarios que coincidan con el filtro."
    >
      <template #cell-name="{ row }">
        <div class="u" v-if="row">
          <span class="u-avatar" :class="{ admin: asUser(row).role === 'admin' }">
            {{ initials(asUser(row).name) }}
          </span>
          <div>
            <div class="u-name">
              {{ asUser(row).name }}
              <span v-if="asUser(row).id === currentUser?.id" class="badge badge-green">Tú</span>
            </div>
            <div class="soft u-mail">{{ asUser(row).email }}</div>
          </div>
        </div>
      </template>

      <template #cell-role="{ value }">
        <span class="badge" :class="value === 'admin' ? 'badge-indigo' : 'badge-gray'">
          <component :is="value === 'admin' ? ShieldCheck : User" :size="12" />
          {{ value === 'admin' ? 'Administrador' : 'Usuario' }}
        </span>
      </template>

      <template #cell-createdAt="{ value }">{{ formatDate(String(value)) }}</template>

      <template #actions="{ row }">
        <button
          class="btn btn-ghost btn-sm"
          @click="changeRole(asUser(row))"
          :disabled="asUser(row).id === currentUser?.id"
          title="Cambiar rol"
        >
          {{ asUser(row).role === 'admin' ? 'A usuario' : 'A admin' }}
        </button>
      </template>
    </TablaGenerica>
  </div>
</template>

<style scoped>
.head {
  margin-bottom: 20px;
}
.mb {
  margin-bottom: 20px;
}
.toolbar {
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
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
.u-mail {
  font-size: 0.78rem;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--danger);
}
.status-dot.on {
  background: var(--primary);
}
.btn[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>