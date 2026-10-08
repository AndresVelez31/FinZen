<script setup lang="ts">
// External imports
import { ArrowLeft, Save } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Internal imports
import MoneyInput from '@/components/shared/MoneyInputComponent.vue';
import type { CreateAccountDTO } from '@/dtos/CreateAccountDTO.js';
import type { UpdateAccountDTO } from '@/dtos/UpdateAccountDTO.js';
import { ACCOUNT_TYPE_OPTIONS } from '@/enums/constants.js';
import type { AccountFormErrorsInterface } from '@/interfaces/AccountFormErrorsInterface.js';
import { AccountService } from '@/services/AccountService.js';

// Variables
const route = useRoute();
const router = useRouter();

// Reactive variables
const form = ref({
  name: '',
  type: ACCOUNT_TYPE_OPTIONS[0]!.value,
  balance: '',
});
const errors = ref<AccountFormErrorsInterface>({});
const saving = ref(false);

// Computed
const editing = computed(() => route.name === 'accounts.edit');
const accountId = computed(() => Number(route.params.id));

// Actions
function validate(): boolean {
  const validationErrors: AccountFormErrorsInterface = {};

  if (!form.value.name.trim()) {
    validationErrors.name = 'El nombre de la cuenta es obligatorio.';
  }
  if (!form.value.type) {
    validationErrors.type = 'Selecciona un tipo de cuenta.';
  }

  const amount = Number(form.value.balance);
  if (form.value.balance === '' || Number.isNaN(amount) || amount < 0) {
    validationErrors.balance = 'Introduce un saldo inicial válido (mayor o igual a 0).';
  }

  errors.value = validationErrors;
  return Object.keys(validationErrors).length === 0;
}

function buildAccountFields(): CreateAccountDTO {
  return {
    name: form.value.name.trim(),
    type: form.value.type,
    balance: Number(form.value.balance),
  };
}

async function submit(): Promise<void> {
  if (saving.value || !validate()) {
    return;
  }

  saving.value = true;

  try {
    if (editing.value) {
      const updateAccountDTO: UpdateAccountDTO = { id: accountId.value, ...buildAccountFields() };
      await AccountService.update(updateAccountDTO);
    } else {
      await AccountService.create(buildAccountFields());
    }

    await Swal.fire({
      title: editing.value ? 'Cuenta actualizada' : 'Cuenta creada',
      icon: 'success',
      timer: 1300,
      showConfirmButton: false,
    });
    await router.push({ name: 'accounts' });
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo guardar la cuenta',
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
    const account = await AccountService.getByIdAndUserId(accountId.value);
    form.value = {
      name: account.name,
      type: account.type,
      balance: String(account.balance),
    };
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo cargar la cuenta',
      text: (error as Error).message,
      icon: 'error',
    });
    await router.replace({ name: 'accounts' });
  }
});
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" :disabled="saving" @click="router.back()">
      <ArrowLeft :size="17" />
      Volver
    </button>

    <h2 class="page-title">
      {{ editing ? 'Editar cuenta' : 'Nueva cuenta' }}
    </h2>

    <p class="muted">Completa los datos de tu cuenta.</p>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="name">Nombre de la cuenta</label>
        <input id="name" class="input" v-model="form.name" placeholder="Ej: Bancolombia" :disabled="saving" />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label>Tipo de cuenta</label>

        <div class="type-grid">
          <button
            v-for="type in ACCOUNT_TYPE_OPTIONS"
            :key="type.value"
            type="button"
            class="type-opt"
            :class="{ active: form.type === type.value }"
            :disabled="saving"
            @click="form.type = type.value"
          >
            <component :is="type.icon" :size="17" />

            {{ type.label }}
          </button>
        </div>
        <span v-if="errors.type" class="field-error">{{ errors.type }}</span>
      </div>

      <div class="field">
        <label for="balance">Saldo inicial</label>
        <MoneyInput id="balance" v-model="form.balance" :invalid="Boolean(errors.balance)" :disabled="saving" />
        <span v-if="errors.balance" class="field-error">{{ errors.balance }}</span>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-ghost" :disabled="saving" @click="router.push({ name: 'accounts' })">
          Cancelar
        </button>

        <button type="submit" class="btn btn-primary" :disabled="saving">
          <Save :size="17" />

          {{ saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear cuenta' }}
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

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.type-opt {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
  transition: all 0.18s ease;
}

.type-opt.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-strong);
}

html.dark .type-opt.active {
  color: var(--primary);
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
