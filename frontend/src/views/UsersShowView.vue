<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ShieldCheck, Users as UsersIcon } from 'lucide-vue-next';
import UsersTable from '@/components/users/UsersTable.vue';
import SelectorFilter from '@/components/shared/SelectorFilter.vue';
import StatCard from '@/components/shared/StatCard.vue';
import { UserService } from '@/services/UserService.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';

const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 450));

const fRole = ref('');
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

const currentUser = computed(() => UserService.getCurrent());

const rows = computed(() =>
  UserService.getAll().filter((user) => (fRole.value ? user.role === fRole.value : true)),
);

const stats = computed(() => {
  const users = UserService.getAll();
  return {
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
  };
});

function changeRole(user: UserInterface): void {
  const newRole = user.role === 'admin' ? 'user' : 'admin';

  const confirmed = confirm(`¿Desea cambiar el rol de ${user.name}?`);

  if (!confirmed) {
    return;
  }

  UserService.updateRole(user.id, newRole);
}

function toggleActive(user: UserInterface): void {
  const action = user.active ? 'desactivar' : 'activar';

  const confirmed = confirm(`¿Desea ${action} al usuario ${user.name}?`);

  if (!confirmed) {
    return;
  }

  UserService.toggleActive(user.id);
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
      <StatCard title="Usuarios totales" :value="String(stats.total)" :icon="UsersIcon" />

      <StatCard title="Administradores" :value="String(stats.admins)" :icon="ShieldCheck" />
    </div>

    <div class="card toolbar">
      <SelectorFilter
        label="Filtrar por rol"
        v-model="fRole"
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
