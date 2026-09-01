<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Save, Landmark, PiggyBank, Wallet, Smartphone } from 'lucide-vue-next';

import { AccountService } from '@/services/AccountService.js';
import type { CreateAccountDTO } from '@/dtos/CreateAccountDTO.js';
import type { UpdateAccountDTO } from '@/dtos/UpdateAccountDTO.js';

const route = useRoute();
const router = useRouter();

const TYPES = [
  { value: 'Corriente', label: 'Corriente', icon: Landmark },
  { value: 'Ahorros', label: 'Ahorros', icon: PiggyBank },
  { value: 'Efectivo', label: 'Efectivo', icon: Wallet },
  { value: 'Digital', label: 'Digital', icon: Smartphone },
  { value: 'Inversión', label: 'Inversión', icon: Landmark },
];

const editing = ref(false);

const form = ref({
  name: '',
  type: 'Ahorros',
  balance: 0,
});

const errors = ref<{
  name?: string;
  balance?: string;
}>({});

const saving = ref(false);

onMounted(() => {
  if (route.name === 'account-edit') {
    const accountId = Number(route.params.id);

    const account = AccountService.getAccountById(accountId);

    if (!account) {
      router.replace({ name: 'accounts' });
      return;
    }

    editing.value = true;

    form.value = {
      name: account.name,
      type: account.type,
      balance: account.balance,
    };
  }
});

function validate(): boolean {
  const newErrors: {
    name?: string;
    balance?: string;
  } = {};

  if (!form.value.name.trim()) {
    newErrors.name = 'El nombre de la cuenta es obligatorio.';
  }

  if (isNaN(Number(form.value.balance))) {
    newErrors.balance = 'Introduce un saldo válido.';
  }

  errors.value = newErrors;

  return Object.keys(newErrors).length === 0;
}

function submit(): void {
  if (!validate()) {
    return;
  }

  saving.value = true;

  if (editing.value) {
    const accountId = Number(route.params.id);

    const account: UpdateAccountDTO = {
      name: form.value.name.trim(),
      type: form.value.type,
      balance: Number(form.value.balance),
    };

    AccountService.updateAccount(accountId, account);
  } else {
    const account: CreateAccountDTO = {
      name: form.value.name.trim(),
      type: form.value.type,
      balance: Number(form.value.balance),
    };

    AccountService.createAccount(account);
  }

  saving.value = false;

  router.push({ name: 'accounts' });
}
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" @click="router.back()">
      <ArrowLeft :size="17" />
      Volver
    </button>

    <h2 class="page-title">
      {{ editing ? 'Editar cuenta' : 'Nueva cuenta' }}
    </h2>

    <p class="muted">Completa los datos de tu cuenta.</p>

    <form class="card form" @submit.prevent="submit">
      <!-- Nombre -->
      <div class="field">
        <label for="name"> Nombre / Entidad </label>

        <input
          id="name"
          v-model="form.name"
          class="input"
          type="text"
          placeholder="Ej: Bancolombia"
        />

        <span v-if="errors.name" class="err">
          {{ errors.name }}
        </span>
      </div>

      <!-- Tipo -->
      <div class="field">
        <label>Tipo de cuenta</label>

        <div class="type-grid">
          <button
            v-for="type in TYPES"
            :key="type.value"
            type="button"
            class="type-opt"
            :class="{ active: form.type === type.value }"
            @click="form.type = type.value"
          >
            <component :is="type.icon" :size="17" />

            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- Saldo -->
      <div class="field">
        <label for="balance"> Saldo </label>

        <div class="amount-wrap">
          <span class="currency">$</span>

          <input
            id="balance"
            v-model.number="form.balance"
            class="input amount"
            type="number"
            step="1000"
            placeholder="0"
          />
        </div>

        <span v-if="errors.balance" class="err">
          {{ errors.balance }}
        </span>
      </div>

      <!-- Botones -->
      <div class="actions">
        <button type="button" class="btn btn-ghost" @click="router.push({ name: 'accounts' })">
          Cancelar
        </button>

        <button type="submit" class="btn btn-primary">
          <Save :size="17" />

          {{ editing ? 'Guardar cambios' : 'Crear cuenta' }}
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
  .type-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
