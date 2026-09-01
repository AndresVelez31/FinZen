<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-vue-next';
import { AccountService } from '@/services/AccountService.js';

const accounts = computed(() => AccountService.getAccounts());

function getBalance(id: number): number {
  return AccountService.getAccountBalance(id);
}

function formatToCOP(value: number): string {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(value);
}

function deleteAccount(id: number): void {
  const confirmed = confirm(
    '¿Está seguro de eliminar esta cuenta? También se eliminarán las transacciones asociadas.',
  );

  if (!confirmed) {
    return;
  }

  AccountService.deleteAccount(id);
}

</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Cuentas</h2>

        <p class="muted">
          Administra tus cuentas bancarias, efectivo y billeteras digitales.
        </p>
      </div>

      <RouterLink
        to="/accounts/new"
        class="btn btn-primary"
      >
        <Plus :size="18" />
        Nueva cuenta
      </RouterLink>
    </div>

    <div v-if="accounts.length > 0" class="grid">
      <article
        v-for="account in accounts"
        :key="account.id"
        class="card acc"
      >
        <div class="acc-top">
          <div class="acc-icon">
            <Wallet :size="20" />
          </div>

          <div class="acc-titles">
            <h3>{{ account.name }}</h3>

            <span class="soft">
              {{ account.type }}
            </span>
          </div>

          <div class="acc-actions">
            <RouterLink
              :to="`/accounts/${account.id}/edit`"
              class="btn btn-ghost btn-icon"
              aria-label="Editar cuenta"
            >
              <Pencil :size="15" />
            </RouterLink>

            <button
              class="btn btn-danger btn-icon"
              aria-label="Eliminar cuenta"
              @click="deleteAccount(account.id)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <div class="acc-balance">
          <span class="soft">
            Saldo actual
          </span>

          <strong>
            {{ formatToCOP(getBalance(account.id)) }}
          </strong>
        </div>

        <div class="acc-foot">
          <span class="badge badge-gray">
            {{ account.type }}
          </span>
        </div>
      </article>
    </div>

    <div v-else class="card empty-state">
      <div class="empty-icon">
        <Wallet :size="26" />
      </div>

      <h4>Aún no tienes cuentas</h4>

      <p class="muted">
        Crea tu primera cuenta para comenzar a registrar movimientos.
      </p>

      <RouterLink
        to="/accounts/new"
        class="btn btn-primary"
      >
        <Plus :size="17" />
        Crear cuenta
      </RouterLink>
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
.acc {
  padding: 20px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.acc:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.acc-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.acc-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary-strong);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
html.dark .acc-icon {
  color: var(--primary);
}
.acc-titles {
  flex: 1;
  min-width: 0;
}
.acc-titles h3 {
  font-size: 1.05rem;
  margin-bottom: 2px;
}
.acc-actions {
  display: flex;
  gap: 4px;
}
.acc-balance {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 18px 0 14px;
}
.acc-balance strong {
  font-family: var(--font-head);
  font-size: 1.4rem;
}
.acc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 0.82rem;
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
