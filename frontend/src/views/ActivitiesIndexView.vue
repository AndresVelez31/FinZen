<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, Pencil, Trash2, Target, PiggyBank, X } from 'lucide-vue-next';
import GenericTable from '@/components/shared/GenericTable.vue';
import { ActivityService } from '@/services/ActivityService.js';
import { formatToCOP } from '@/utils/formatters.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';

const loading = ref(true);
onMounted(() => setTimeout(() => (loading.value = false), 450));

const activities = computed(() => ActivityService.getActivities());

const columns = [
  { key: 'name', label: 'Actividad' },
  { key: 'type', label: 'Tipo' },
  { key: 'targetAmount', label: 'Presupuesto / Meta', align: 'right' },
];

// Helper para tipar la fila directamente en el script (mismo patrón que UsersView.vue)
function asActivity(row: unknown): ActivityInterface {
  return row as ActivityInterface;
}

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
    await Swal.fire({ title: 'Actividad eliminada', icon: 'success', timer: 1100, showConfirmButton: false });
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

    <GenericTable
      :columns="columns"
      :rows="activities"
      :loading="loading"
      :hasActions="true"
      emptyTitle="Aún no tienes actividades"
      emptyText="Crea tu primera categoría de gasto o meta de ahorro."
    >
      <template #cell-name="{ row }">
        <div class="act-name">
          <span class="dot" :style="{ background: asActivity(row).color }"></span>
          {{ asActivity(row).name }}
        </div>
      </template>

      <template #cell-type="{ value }">
        <span class="badge" :class="value === 'expense' ? 'badge-red' : 'badge-green'">
          <component :is="value === 'expense' ? Target : PiggyBank" :size="12" />
          {{ value === 'expense' ? 'Gasto' : 'Ahorro' }}
        </span>
      </template>

      <template #cell-targetAmount="{ value }">{{ formatToCOP(Number(value)) }}</template>

      <template #actions="{ row }">
        <button
          class="btn btn-ghost btn-icon"
          @click="openEdit(asActivity(row))"
          aria-label="Editar actividad"
        >
          <Pencil :size="15" />
        </button>
        <button
          class="btn btn-danger btn-icon"
          @click="remove(asActivity(row))"
          aria-label="Eliminar actividad"
        >
          <Trash2 :size="15" />
        </button>
      </template>
    </GenericTable>

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
.act-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
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
