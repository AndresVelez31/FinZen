<script setup lang="ts">
// External imports
import { Pencil, PiggyBank, Plus, Target, Trash2 } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Internal imports
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
import { ActivityService } from '@/services/ActivityService.js';
import { TransactionService } from '@/services/TransactionService.js';
import { ActivityUtil } from '@/utils/ActivityUtil.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

// Variables
const router = useRouter();

// Reactive variables
const activities = ref<ActivityInterface[]>([]);
const transactions = ref<TransactionInterface[]>([]);
const loading = ref(true);

// Computed
// Each activity plus how much of its target amount has been used.
const activitiesProgress = computed(() =>
  ActivityUtil.calculateTargetProgress(activities.value, transactions.value),
);

// Actions
async function deleteActivity(activity: ActivityInterface): Promise<void> {
  const result = await Swal.fire({
    title: '¿Eliminar actividad?',
    html: `<b>${activity.name}</b><br>También se eliminarán las transacciones asociadas.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await ActivityService.delete(activity.id);
    activities.value = activities.value.filter(
      (existingActivity) => existingActivity.id !== activity.id,
    );
    // The API cascades the activity's transactions, so they leave the list too.
    transactions.value = transactions.value.filter(
      (transaction) => transaction.activityId !== activity.id,
    );
    await Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1100, showConfirmButton: false });
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo eliminar la actividad',
      text: (error as Error).message,
      icon: 'error',
    });
  }
}

// Lifecycle
onMounted(async () => {
  try {
    activities.value = await ActivityService.getAllByUserId();
    transactions.value = await TransactionService.getAllByUserId();
  } catch (error) {
    await Swal.fire({
      title: 'No se pudieron cargar las actividades',
      text: (error as Error).message,
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Actividades</h2>
        <p class="muted">Gestiona tus categorías de gasto y metas de ahorro.</p>
      </div>
      <button class="btn btn-primary" @click="router.push({ name: 'activities.create' })">
        <Plus :size="18" /> Nueva actividad
      </button>
    </div>

    <div v-if="activitiesProgress.length" class="grid">
      <article v-for="activity in activitiesProgress" :key="activity.id" class="card act" :style="{ '--c': activity.color }">
        <div class="act-top">
          <span class="act-dot"></span>
          <div class="act-titles">
            <h3>{{ activity.name }}</h3>
            <span class="badge" :class="activity.type === 'expense' ? 'badge-red' : 'badge-green'">
              <component :is="activity.type === 'expense' ? Target : PiggyBank" :size="12" />
              {{ activity.type === 'expense' ? 'Gasto' : 'Ahorro' }}
            </span>
          </div>
          <div class="act-actions">
            <button
              class="btn btn-ghost btn-icon"
              @click="router.push({ name: 'activities.edit', params: { id: activity.id } })"
              aria-label="Editar"
            >
              <Pencil :size="15" />
            </button>
            <button class="btn btn-danger btn-icon" @click="deleteActivity(activity)" aria-label="Eliminar">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <div class="act-meta">
          <span class="soft">{{
            activity.type === 'expense' ? 'Presupuesto mensual' : 'Meta de ahorro'
          }}</span>
          <strong>{{ FormattersUtil.formatToCOP(activity.targetAmount) }}</strong>
        </div>

        <div class="progress">
          <div class="bar">
            <span
              :style="{
                width: activity.percent + '%',
                background: activity.over ? 'var(--danger)' : activity.color,
              }"
            ></span>
          </div>
          <div class="progress-foot">
            <span :class="{ over: activity.over }"
              >{{ FormattersUtil.formatToCOP(activity.used) }}
              {{ activity.type === 'expense' ? 'gastado' : 'ahorrado' }}</span
            >
            <span class="soft">{{ activity.percent }}%</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else-if="!loading" class="card empty-state">
      <div class="empty-icon"><Target :size="26" /></div>
      <h4>Aún no tienes actividades</h4>
      <p class="muted">Crea tu primera categoría de gasto o meta de ahorro.</p>
      <button class="btn btn-primary" @click="router.push({ name: 'activities.create' })">
        <Plus :size="17" /> Crear actividad
      </button>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}
.act {
  padding: 20px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.act:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.act-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.act-dot {
  width: 14px;
  height: 14px;
  border-radius: 5px;
  background: var(--c);
  margin-top: 4px;
  flex-shrink: 0;
}
.act-titles {
  flex: 1;
  min-width: 0;
}
.act-titles h3 {
  font-size: 1.05rem;
  margin-bottom: 6px;
}
.act-actions {
  display: flex;
  gap: 4px;
}
.act-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 10px;
}
.act-meta strong {
  font-family: var(--font-head);
  font-size: 1.15rem;
}
.bar {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.progress-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}
.progress-foot .over {
  color: var(--danger);
}

.empty-state {
  text-align: center;
  padding: 54px 20px;
}
.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--surface-2);
  color: var(--text-soft);
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}
.empty-state h4 {
  margin-bottom: 4px;
}
.empty-state .btn {
  margin-top: 16px;
}
</style>
