<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, Pencil, Trash2, Target, PiggyBank, X } from 'lucide-vue-next';
import { ActivityService } from '@/services/ActivityService.js';
import { ReportService } from '@/services/ReportService.js';
import { formatToCOP } from '@/utils/formatters.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';

const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 450));

const activities = computed(() => ActivityService.getActivities());

const COLOR_PRESET = [
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#ef4444',
];

// Presupuestos ('expense') se miden contra el mes actual; metas de ahorro
// ('savings') se miden contra el histórico completo.
const today = new Date();
const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
const monthEnd = today.toISOString().slice(0, 10);

const monthlyExpenses = computed(() => ReportService.getExpensesByActivity(monthStart, monthEnd));
const allTimeExpenses = computed(() => ReportService.getExpensesByActivity());

interface ActivityCard extends ActivityInterface {
  used: number;
  percent: number;
  over: boolean;
}

const cards = computed<ActivityCard[]>(() =>
  activities.value.map((activity) => {
    const source = activity.type === 'expense' ? monthlyExpenses.value : allTimeExpenses.value;
    const used = source.find((entry) => entry.activityId === activity.id)?.total ?? 0;
    const percent =
      activity.targetAmount > 0 ? Math.min(100, Math.round((used / activity.targetAmount) * 100)) : 0;

    return {
      ...activity,
      used,
      percent,
      over: activity.type === 'expense' && used > activity.targetAmount,
    };
  }),
);

const showModal = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  name: '',
  color: COLOR_PRESET[0] as string,
  type: 'expense',
  targetAmount: '',
});

interface FormErrors {
  name?: string;
  targetAmount?: string;
}

const errors = ref<FormErrors>({});
const saving = ref(false);

function openNew(): void {
  editingId.value = null;
  form.value = { name: '', color: COLOR_PRESET[0] as string, type: 'expense', targetAmount: '' };
  errors.value = {};
  showModal.value = true;
}

function openEdit(activity: ActivityInterface): void {
  editingId.value = activity.id;
  form.value = {
    name: activity.name,
    color: activity.color,
    type: activity.type,
    targetAmount: String(activity.targetAmount),
  };
  errors.value = {};
  showModal.value = true;
}

function validate(): boolean {
  const validationErrors: FormErrors = {};

  if (!form.value.name.trim()) {
    validationErrors.name = 'El nombre es obligatorio.';
  }

  const targetAmount = Number(form.value.targetAmount);
  if (!form.value.targetAmount || Number.isNaN(targetAmount) || targetAmount <= 0) {
    validationErrors.targetAmount = 'Introduce un monto válido mayor que 0.';
  }

  errors.value = validationErrors;
  return Object.keys(validationErrors).length === 0;
}

async function save(): Promise<void> {
  if (!validate()) {
    return;
  }

  saving.value = true;
  const Swal = (await import('sweetalert2')).default;

  try {
    if (editingId.value) {
      const dto: UpdateActivityDTO = {
        name: form.value.name.trim(),
        color: form.value.color,
        type: form.value.type,
        targetAmount: Number(form.value.targetAmount),
      };
      ActivityService.updateActivity(editingId.value, dto);
    } else {
      const dto: CreateActivityDTO = {
        name: form.value.name.trim(),
        color: form.value.color,
        type: form.value.type,
        targetAmount: Number(form.value.targetAmount),
      };
      ActivityService.createActivity(dto);
    }

    showModal.value = false;
    await Swal.fire({
      title: editingId.value ? 'Actividad actualizada' : 'Actividad creada',
      icon: 'success',
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
    await Swal.fire({ title: 'No se pudo guardar la actividad', text: message, icon: 'error' });
  } finally {
    saving.value = false;
  }
}

async function remove(activity: ActivityInterface): Promise<void> {
  const Swal = (await import('sweetalert2')).default;
  const result = await Swal.fire({
    title: '¿Eliminar actividad?',
    html: `<b>${activity.name}</b><br>Las transacciones asociadas no se eliminarán.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });

  if (result.isConfirmed) {
    ActivityService.deleteActivity(activity.id);
    await Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1100, showConfirmButton: false });
  }
}
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Actividades</h2>
        <p class="muted">Gestiona tus categorías de gasto y metas de ahorro.</p>
      </div>
      <button class="btn btn-primary" @click="openNew"><Plus :size="18" /> Nueva actividad</button>
    </div>

    <div v-if="loading" class="grid">
      <div v-for="n in 3" :key="n" class="card act skeleton-card"></div>
    </div>

    <div v-else-if="cards.length" class="grid">
      <article v-for="activity in cards" :key="activity.id" class="card act" :style="{ '--c': activity.color }">
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
            <button class="btn btn-ghost btn-icon" @click="openEdit(activity)" aria-label="Editar">
              <Pencil :size="15" />
            </button>
            <button class="btn btn-danger btn-icon" @click="remove(activity)" aria-label="Eliminar">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <div class="act-meta">
          <span class="soft">{{
            activity.type === 'expense' ? 'Presupuesto mensual' : 'Meta de ahorro'
          }}</span>
          <strong>{{ formatToCOP(activity.targetAmount) }}</strong>
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
              >{{ formatToCOP(activity.used) }}
              {{ activity.type === 'expense' ? 'gastado' : 'ahorrado' }}</span
            >
            <span class="soft">{{ activity.percent }}%</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="card empty-state">
      <div class="empty-icon"><Target :size="26" /></div>
      <h4>Aún no tienes actividades</h4>
      <p class="muted">Crea tu primera categoría de gasto o meta de ahorro.</p>
      <button class="btn btn-primary" @click="openNew"><Plus :size="17" /> Crear actividad</button>
    </div>

    <!-- Modal -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal card">
          <div class="modal-head">
            <h3>{{ editingId ? 'Editar actividad' : 'Nueva actividad' }}</h3>
            <button class="btn btn-ghost btn-icon" @click="showModal = false" aria-label="Cerrar">
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <div class="field">
              <label for="name">Nombre</label>
              <input id="name" v-model="form.name" class="input" placeholder="Ej: Alimentación" />
              <span v-if="errors.name" class="err">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label>Tipo</label>
              <div class="type-toggle">
                <button
                  type="button"
                  class="type-opt"
                  :class="{ active: form.type === 'expense' }"
                  @click="form.type = 'expense'"
                >
                  <Target :size="16" /> Gasto
                </button>
                <button
                  type="button"
                  class="type-opt save"
                  :class="{ active: form.type === 'savings' }"
                  @click="form.type = 'savings'"
                >
                  <PiggyBank :size="16" /> Ahorro
                </button>
              </div>
            </div>

            <div class="field">
              <label for="targetAmount">{{
                form.type === 'expense' ? 'Presupuesto mensual' : 'Meta de ahorro'
              }}</label>
              <div class="amount-wrap">
                <span class="cur">$</span>
                <input
                  id="targetAmount"
                  v-model="form.targetAmount"
                  class="input amt"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                />
              </div>
              <span v-if="errors.targetAmount" class="err">{{ errors.targetAmount }}</span>
            </div>

            <div class="field">
              <label>Color</label>
              <div class="colors">
                <button
                  v-for="color in COLOR_PRESET"
                  :key="color"
                  type="button"
                  class="swatch"
                  :class="{ sel: form.color === color }"
                  :style="{ background: color }"
                  :aria-label="color"
                  @click="form.color = color"
                ></button>
                <input
                  v-model="form.color"
                  type="color"
                  class="color-input"
                  aria-label="Color personalizado"
                />
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
            <button class="btn btn-primary" :disabled="saving" @click="save">
              {{ saving ? 'Guardando…' : editingId ? 'Guardar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
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
.skeleton-card {
  height: 176px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: 20px;
}
.modal {
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-lg);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}
.modal-head h3 {
  font-size: 1.1rem;
}
.modal-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--border);
}
.type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.type-opt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px;
  border-radius: 11px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
}
.type-opt.active {
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  color: var(--danger);
}
.type-opt.save.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-strong);
}
.amount-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.cur {
  position: absolute;
  left: 13px;
  font-weight: 700;
  color: var(--text-muted);
}
.amt {
  padding-left: 30px;
  font-weight: 700;
}
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.swatch {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: 2px solid transparent;
  transition: transform 0.15s ease;
}
.swatch:hover {
  transform: scale(1.1);
}
.swatch.sel {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--surface) inset;
}
.color-input {
  width: 34px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  padding: 2px;
}
.err {
  color: var(--danger);
  font-size: 0.78rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.22s ease;
}
.modal-enter-from .modal {
  transform: translateY(16px) scale(0.98);
}
</style>
