<script setup lang="ts">
// Imports
import { ArrowLeft, Save, TrendingDown, TrendingUp } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { CreateTransactionDTO } from '@/dtos/CreateTransactionDTO.js';
import type { UpdateTransactionDTO } from '@/dtos/UpdateTransactionDTO.js';
import type { AccountInterface } from '@/interfaces/AccountInterface.js';
import type { ActivityInterface } from '@/interfaces/ActivityInterface.js';
import type { TransactionFormErrorsInterface } from '@/interfaces/TransactionFormErrorsInterface.js';
import { AccountService } from '@/services/AccountService.js';
import { ActivityService } from '@/services/ActivityService.js';
import { TransactionService } from '@/services/TransactionService.js';

// State
const route = useRoute();
const router = useRouter();

const accounts = ref<AccountInterface[]>([]);
const activities = ref<ActivityInterface[]>([]);

const form = ref({
  type: 'expense',
  amount: '',
  accountId: null as number | null,
  activityId: null as number | null,
  date: new Date().toISOString().slice(0, 10),
  description: '',
});
const errors = ref<TransactionFormErrorsInterface>({});
const saving = ref(false);

// Computed
const editing = computed(() => route.name === 'transactions.edit');
const transactionId = computed(() => Number(route.params.id));

// Actions
function validate(): boolean {
  const validationErrors: TransactionFormErrorsInterface = {};

  const amount = Number(form.value.amount);
  if (!form.value.amount || Number.isNaN(amount) || amount <= 0) {
    validationErrors.amount = 'Introduce un importe válido mayor que 0.';
  }
  if (!form.value.accountId) {
    validationErrors.accountId = 'Selecciona una cuenta.';
  }
  if (!form.value.activityId) {
    validationErrors.activityId = 'Selecciona una actividad.';
  }
  if (!form.value.date) {
    validationErrors.date = 'Selecciona una fecha.';
  }
  if (!form.value.description.trim()) {
    validationErrors.description = 'Añade una descripción.';
  }

  errors.value = validationErrors;
  return Object.keys(validationErrors).length === 0;
}

function buildTransactionFields(accountId: number, activityId: number): CreateTransactionDTO {
  return {
    type: form.value.type,
    amount: Number(form.value.amount),
    accountId,
    activityId,
    date: form.value.date,
    description: form.value.description.trim(),
  };
}

async function submit(): Promise<void> {
  const { accountId, activityId } = form.value;
  if (saving.value || !validate() || !accountId || !activityId) {
    return;
  }

  saving.value = true;

  try {
    if (editing.value) {
      const updateTransactionDTO: UpdateTransactionDTO = {
        id: transactionId.value,
        ...buildTransactionFields(accountId, activityId),
      };
      await TransactionService.update(updateTransactionDTO);
    } else {
      await TransactionService.create(buildTransactionFields(accountId, activityId));
    }

    await Swal.fire({
      title: editing.value ? 'Transacción actualizada' : 'Transacción creada',
      icon: 'success',
      timer: 1300,
      showConfirmButton: false,
    });
    await router.push({ name: 'transactions' });
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo guardar la transacción',
      text: (error as Error).message,
      icon: 'error',
    });
  } finally {
    saving.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  try {
    accounts.value = await AccountService.getAll();
    activities.value = await ActivityService.getAll();

    if (!editing.value) {
      form.value.accountId = accounts.value[0]?.id ?? null;
      form.value.activityId = activities.value[0]?.id ?? null;
      return;
    }

    const transaction = await TransactionService.getById(transactionId.value);
    form.value = {
      type: transaction.type,
      amount: String(transaction.amount),
      accountId: transaction.accountId,
      activityId: transaction.activityId,
      date: transaction.date,
      description: transaction.description,
    };
  } catch (error) {
    await Swal.fire({
      title: 'No se pudo cargar la transacción',
      text: (error as Error).message,
      icon: 'error',
    });
    await router.replace({ name: 'transactions' });
  }
});
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" :disabled="saving" @click="router.back()"><ArrowLeft :size="17" /> Volver</button>
    <h2 class="page-title">{{ editing ? 'Editar transacción' : 'Nueva transacción' }}</h2>
    <p class="muted">Completa los datos del movimiento.</p>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <label>Tipo de movimiento</label>
        <div class="type-toggle">
          <button
            type="button"
            class="type-opt expense"
            :class="{ active: form.type === 'expense' }"
            :disabled="saving"
            @click="form.type = 'expense'"
          >
            <TrendingDown :size="18" /> Gasto
          </button>
          <button
            type="button"
            class="type-opt income"
            :class="{ active: form.type === 'income' }"
            :disabled="saving"
            @click="form.type = 'income'"
          >
            <TrendingUp :size="18" /> Ingreso
          </button>
        </div>
      </div>

      <div class="field">
        <label for="amount">Importe</label>
        <div class="amount-wrap">
          <span class="currency">$</span>
          <input
            id="amount"
            v-model="form.amount"
            class="input amount"
            type="number"
            step="1000"
            min="0"
            placeholder="0"
            :disabled="saving"
          />
        </div>
        <span v-if="errors.amount" class="err">{{ errors.amount }}</span>
      </div>

      <div class="row-2">
        <div class="field">
          <label for="account">Cuenta</label>
          <select id="account" v-model="form.accountId" class="select" :disabled="saving">
            <option :value="null" disabled>Selecciona cuenta</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }} ({{ account.type }})
            </option>
          </select>
          <span v-if="errors.accountId" class="err">{{ errors.accountId }}</span>
        </div>

        <div class="field">
          <label for="activity">Actividad</label>
          <select id="activity" v-model="form.activityId" class="select" :disabled="saving">
            <option :value="null" disabled>Selecciona actividad</option>
            <option v-for="activity in activities" :key="activity.id" :value="activity.id">
              {{ activity.name }} ({{ activity.type === 'expense' ? 'Gasto' : 'Ahorro' }})
            </option>
          </select>
          <span v-if="errors.activityId" class="err">{{ errors.activityId }}</span>
        </div>
      </div>

      <div class="field">
        <label for="date">Fecha</label>
        <input id="date" v-model="form.date" class="input" type="date" :disabled="saving" />
        <span v-if="errors.date" class="err">{{ errors.date }}</span>
      </div>

      <div class="field">
        <label for="desc">Descripción</label>
        <textarea
          id="desc"
          v-model="form.description"
          class="input"
          rows="2"
          placeholder="Ej: Compra en supermercado"
          :disabled="saving"
        ></textarea>
        <span v-if="errors.description" class="err">{{ errors.description }}</span>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-ghost" :disabled="saving" @click="router.push({ name: 'transactions' })">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <Save :size="17" />
          {{ saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear transacción' }}
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
  gap: 8px;
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
  transition: all 0.18s ease;
}
.type-opt.expense.active {
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  color: var(--danger);
}
.type-opt.income.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-strong);
}
html.dark .type-opt.income.active {
  color: var(--primary);
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
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  .row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
