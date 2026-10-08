<script setup lang="ts">
// External imports
import { ArrowLeft, PiggyBank, Save, Target } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Internal imports
import MoneyInput from '@/components/shared/MoneyInputComponent.vue';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO.js';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO.js';
import { ACTIVITY_COLORS } from '@/enums/constants.js';
import type { ActivityFormErrorsInterface } from '@/interfaces/ActivityFormErrorsInterface.js';
import { ActivityService } from '@/services/ActivityService.js';

// Variables
const route = useRoute();
const router = useRouter();

// Reactive variables
const form = ref({
  name: '',
  color: ACTIVITY_COLORS[0]!,
  type: 'expense',
  targetAmount: '',
});
const errors = ref<ActivityFormErrorsInterface>({});
const saving = ref(false);

// Computed
const editing = computed(() => route.name === 'activities.edit');
const activityId = computed(() => Number(route.params.id));

// Actions
function validate(): boolean {
  const validationErrors: ActivityFormErrorsInterface = {};

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

function buildActivityFields(): CreateActivityDTO {
  return {
    name: form.value.name.trim(),
    color: form.value.color,
    type: form.value.type,
    targetAmount: Number(form.value.targetAmount),
  };
}

async function submit(): Promise<void> {
  if (saving.value || !validate()) {
    return;
  }

  saving.value = true;

  try {
    if (editing.value) {
      const updateActivityDTO: UpdateActivityDTO = {
        id: activityId.value,
        ...buildActivityFields(),
      };
      await ActivityService.update(updateActivityDTO);
    } else {
      await ActivityService.create(buildActivityFields());
    }

    await Swal.fire({
      title: editing.value ? 'Actividad actualizada' : 'Actividad creada',
      icon: 'success',
      timer: 1200,
      showConfirmButton: false,
    });
    await router.push({ name: 'activities' });
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo guardar la actividad',
      text: (error as Error).message,
      icon: 'error',
    });
  } finally {
    saving.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  if (!editing.value) {
    return;
  }

  try {
    const activity = await ActivityService.getByIdAndUserId(activityId.value);
    form.value = {
      name: activity.name,
      color: activity.color,
      type: activity.type,
      targetAmount: String(activity.targetAmount),
    };
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo cargar la actividad',
      text: (error as Error).message,
      icon: 'error',
    });
    await router.replace({ name: 'activities' });
  }
});
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" :disabled="saving" @click="router.back()"><ArrowLeft :size="17" /> Volver</button>
    <h2 class="page-title">{{ editing ? 'Editar actividad' : 'Nueva actividad' }}</h2>
    <p class="muted">Define una categoría de gasto o una meta de ahorro.</p>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="name">Nombre</label>
        <input id="name" v-model="form.name" class="input" placeholder="Ej: Alimentación" :disabled="saving" />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label>Tipo</label>
        <div class="type-toggle">
          <button
            type="button"
            class="type-opt"
            :class="{ active: form.type === 'expense' }"
            :disabled="saving"
            @click="form.type = 'expense'"
          >
            <Target :size="16" /> Gasto
          </button>
          <button
            type="button"
            class="type-opt save"
            :class="{ active: form.type === 'savings' }"
            :disabled="saving"
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
        <MoneyInput
          id="targetAmount"
          v-model="form.targetAmount"
          :invalid="Boolean(errors.targetAmount)"
          :disabled="saving"
        />
        <span v-if="errors.targetAmount" class="field-error">{{ errors.targetAmount }}</span>
      </div>

      <div class="field">
        <label>Color</label>
        <div class="colors">
          <button
            v-for="color in ACTIVITY_COLORS"
            :key="color"
            type="button"
            class="swatch"
            :class="{ sel: form.color === color }"
            :style="{ background: color }"
            :aria-label="color"
            :disabled="saving"
            @click="form.color = color"
          ></button>
          <input
            v-model="form.color"
            type="color"
            class="color-input"
            aria-label="Color personalizado"
            :disabled="saving"
          />
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-ghost" :disabled="saving" @click="router.push({ name: 'activities' })">
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
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}
@media (max-width: 560px) {
  .form {
    padding: 20px 18px;
    gap: 16px;
  }
  .actions {
    flex-direction: column-reverse;
  }
  .actions .btn {
    width: 100%;
  }
}
</style>
