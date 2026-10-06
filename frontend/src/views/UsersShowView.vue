<script setup lang="ts">
// External imports
import { ShieldCheck, Users as UsersIcon } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';

// Internal imports
import SelectorFilter from '@/components/shared/SelectorFilterComponent.vue';
import StatCard from '@/components/shared/StatCardComponent.vue';
import UsersTable from '@/components/users/UsersTableComponent.vue';
import type { UpdateUserDTO } from '@/dtos/UpdateUserDTO.js';
import { USER_ROLE_OPTIONS } from '@/enums/constants.js';
import type { UserInterface } from '@/interfaces/UserInterface.js';
import { AuthService } from '@/services/AuthService.js';
import { UserService } from '@/services/UserService.js';

// Reactive variables
const users = ref<UserInterface[]>([]);

// Selectors
const filterRole = ref('');

// Computed
const currentUser = computed(() => AuthService.getCurrentUser());

const filteredUsers = computed(() =>
  filterRole.value ? users.value.filter((user) => user.role === filterRole.value) : users.value,
);

const stats = computed(() => ({
  total: users.value.length,
  admins: users.value.filter((user) => user.role === 'admin').length,
}));

// Actions
async function confirmAction(
  title: string,
  text: string,
  confirmButtonText: string,
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#94a3b8',
  });
  return result.isConfirmed;
}

async function saveUser(updateUserDTO: UpdateUserDTO): Promise<void> {
  try {
    const updatedUser = await UserService.update(updateUserDTO);
    users.value = users.value.map((user) => (user.id === updatedUser.id ? updatedUser : user));
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo actualizar el usuario',
      text: (error as Error).message,
      icon: 'error',
    });
  }
}

async function changeRole(user: UserInterface): Promise<void> {
  const confirmed = await confirmAction(
    '¿Cambiar rol?',
    `¿Desea cambiar el rol de ${user.name}?`,
    'Cambiar',
  );
  if (confirmed) {
    await saveUser({ id: user.id, role: user.role === 'admin' ? 'user' : 'admin' });
  }
}

async function toggleActive(user: UserInterface): Promise<void> {
  const action = user.active ? 'Desactivar' : 'Activar';
  const confirmed = await confirmAction(
    `¿${action} usuario?`,
    `¿Desea ${action.toLowerCase()} al usuario ${user.name}?`,
    action,
  );
  if (confirmed) {
    await saveUser({ id: user.id, active: !user.active });
  }
}

// Lifecycle
onMounted(async () => {
  try {
    users.value = await UserService.getAll();
  } catch (error) {
    await Swal.fire({
      title: 'No se pudieron cargar los usuarios',
      text: (error as Error).message,
      icon: 'error',
    });
  }
});
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
        :options="USER_ROLE_OPTIONS"
        placeholder="Todos los roles"
      />
    </div>

    <UsersTable
      :users="filteredUsers"
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
