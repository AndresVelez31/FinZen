<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Save, Target, PiggyBank } from 'lucide-vue-next';
import { ActivityService } from '@/services/ActivityService.js';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';

const route = useRoute();
const router = useRouter();

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

const editing = computed(() => route.name === 'activity-edit');
const activityId = computed(() => (route.params.id ? Number(route.params.id) : null));

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

onMounted(() => {
  if (!editing.value) {
    return;
  }

  const activity = activityId.value ? ActivityService.getActivityById(activityId.value) : undefined;
  if (!activity) {
    router.replace({ name: 'activities' });
    return;
  }

  form.value = {
    name: activity.name,
    color: activity.color,
    type: activity.type,
    targetAmount: String(activity.targetAmount),
  };
});

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

async function submit(): Promise<void> {
  if (!validate()) {
    return;
  }

  saving.value = true;
  const Swal = (await import('sweetalert2')).default;

  try {
    if (editing.value && activityId.value) {
      const dto: UpdateActivityDTO = {
        name: form.value.name.trim(),
        color: form.value.color,
        type: form.value.type,
        targetAmount: Number(form.value.targetAmount),
      };
      ActivityService.updateActivity(activityId.value, dto);
    } else {
      const dto: CreateActivityDTO = {
        name: form.value.name.trim(),
        color: form.value.color,
        type: form.value.type,
        targetAmount: Number(form.value.targetAmount),
      };
      ActivityService.createActivity(dto);
    }

    await Swal.fire({
      title: editing.value ? 'Actividad actualizada' : 'Actividad creada',
      icon: 'success',
      timer: 1200,
      showConfirmButton: false,
    });
    router.push({ name: 'activities' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
    await Swal.fire({ title: 'No se pudo guardar la actividad', text: message, icon: 'error' });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" @click="router.back()"><ArrowLeft :size="17" /> Volver</button>
    <h2 class="page-title">{{ editing ? 'Editar actividad' : 'Nueva actividad' }}</h2>
    <p class="muted">Define una categoría de gasto o una meta de ahorro.</p>

    <form class="card form" @submit.prevent="submit">
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
          <span class="currency">$</span>
          <input
            id="targetAmount"
            v-model="form.targetAmount"
            class="input amount"
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

      <div class="actions">
        <button type="button" class="btn btn-ghost" @click="router.push({ name: 'activities' })">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <Save :size="17" />
          {{ saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear actividad' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-page {
  max-width: 620px;
  margin: 0 auto;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.88rem;
  margin-bottom: 14px;
}
.back:hover {
  color: var(--text);
}
.form {
  padding: 26px;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
  transition: all 0.18s ease;
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
.currency {
  position: absolute;
  left: 14px;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-muted);
}
.amount {
  padding-left: 34px;
  font-size: 1.3rem;
  font-weight: 700;
  font-family: var(--font-head);
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
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}
@media (max-width: 560px) {
  .type-toggle {
    grid-template-columns: 1fr;
  }
}
</style>
