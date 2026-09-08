<script setup lang="ts">
// Imports
import { ref, computed, onMounted } from 'vue';
import { ShieldCheck, Users as UsersIcon } from 'lucide-vue-next';
import UsersTable from '@/components/users/UsersTable.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import StatCard from '@/components/shared/StatCard.vue';
import { UserService } from '@/services/UserService.js';
import { AuthService } from '@/auth/AuthService.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';

// State
const loading = ref(true);
const filterRole = ref('');
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

// Computed
const currentUser = computed(() => AuthService.getCurrentUser());

const rows = computed(() =>
  UserService.getAll().filter((user) => (filterRole.value ? user.role === filterRole.value : true)),
);

const stats = computed(() => {
  const users = UserService.getAll();
  return {
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
  };
});

// Actions
async function changeRole(user: UserInterface): Promise<void> {
  const newRole = user.role === 'admin' ? 'user' : 'admin';
  const Swal = (await import('sweetalert2')).default;

  const result = await Swal.fire({
    title: '¿Cambiar rol?',
    text: `¿Desea cambiar el rol de ${user.name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Cambiar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#94a3b8',
  });

  if (!result.isConfirmed) {
    return;
  }

  UserService.updateRole(user.id, newRole);
}

async function toggleActive(user: UserInterface): Promise<void> {
  const action = user.active ? 'desactivar' : 'activar';
  const Swal = (await import('sweetalert2')).default;

  const result = await Swal.fire({
    title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
    text: `¿Desea ${action} al usuario ${user.name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#94a3b8',
  });

  if (!result.isConfirmed) {
    return;
  }

  UserService.toggleActive(user.id);
}

// Lifecycle
onMounted(() => setTimeout(() => (loading.value = false), 450));
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
      <StatCard title="Usuarios totales" :value="String(stats.total)" :icon="UsersIcon" />

      <StatCard title="Administradores" :value="String(stats.admins)" :icon="ShieldCheck" />
    </div>

    <div class="card toolbar">
      <SelectorFilter
        label="Filtrar por rol"
        v-model="filterRole"
        :options="roleOptions"
        placeholder="Todos los roles"
      />
    </div>

    <UsersTable
      :users="rows"
      :loading="loading"
      :current-user-id="currentUser?.id ?? null"
      @change-role="changeRole"
      @toggle-active="toggleActive"
    />
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
</style>
