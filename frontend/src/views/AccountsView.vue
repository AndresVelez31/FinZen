<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Pencil, Trash2, Landmark, Wallet, PiggyBank, Smartphone } from 'lucide-vue-next';
import { myAccounts, deleteAccount, accountBalance, accountTxCount, formatMoney } from '@/store';

const router = useRouter();

const TYPES = [
  { value: 'checking', label: 'Corriente', icon: Landmark },
  { value: 'savings', label: 'Ahorros', icon: PiggyBank },
  { value: 'cash', label: 'Efectivo', icon: Wallet },
  { value: 'digital', label: 'Digital', icon: Smartphone },
];

function typeMeta(t) {
  return TYPES.find((x) => x.value === t) || TYPES[0];
}

const cards = computed(() =>
  myAccounts.value.map((a) => ({
    ...a,
    balance: accountBalance(a.id),
    txCount: accountTxCount(a.id),
    meta: typeMeta(a.type),
  })),
);

function openNew() {
  router.push({ name: 'account-new' });
}
function openEdit(a) {
  router.push({ name: 'account-edit', params: { id: a.id } });
}

async function remove(a) {
  const Swal = (await import('sweetalert2')).default;
  const txCount = accountTxCount(a.id);
  const res = await Swal.fire({
    title: '¿Eliminar cuenta?',
    html:
      `<b>${a.bank} · ${a.accountNumber}</b>` +
      (txCount > 0
        ? `<br>Se eliminarán también <b>${txCount}</b> transacción(es) asociada(s).`
        : '<br>Esta acción no se puede deshacer.'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });
  if (res.isConfirmed) {
    deleteAccount(a.id);
    Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1100, showConfirmButton: false });
  }
}
</script>

<template>
  <div class="fade-up">
    <div class="head">
      <div>
        <h2 class="page-title">Cuentas</h2>
        <p class="muted">Administra tus cuentas bancarias, efectivo y billeteras digitales.</p>
      </div>
      <button class="btn btn-primary" @click="openNew"><Plus :size="18" /> Nueva cuenta</button>
    </div>

    <div v-if="cards.length" class="grid">
      <article v-for="a in cards" :key="a.id" class="card acc">
        <div class="acc-top">
          <div class="acc-icon"><component :is="a.meta.icon" :size="20" /></div>
          <div class="acc-titles">
            <h3>{{ a.bank }}</h3>
            <span class="soft">{{ a.accountNumber }}</span>
          </div>
          <div class="acc-actions">
            <button class="btn btn-ghost btn-icon" @click="openEdit(a)" aria-label="Editar">
              <Pencil :size="15" />
            </button>
            <button class="btn btn-danger btn-icon" @click="remove(a)" aria-label="Eliminar">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <div class="acc-balance">
          <span class="soft">Saldo actual</span>
          <strong>{{ formatMoney(a.balance) }}</strong>
        </div>

        <div class="acc-foot">
          <span class="badge badge-gray">{{ a.meta.label }}</span>
          <span class="soft">{{ a.txCount }} movimiento{{ a.txCount === 1 ? '' : 's' }}</span>
        </div>
      </article>
    </div>

    <div v-else class="card empty-state">
      <div class="empty-icon"><Wallet :size="26" /></div>
      <h4>Aún no tienes cuentas</h4>
      <p class="muted">Crea tu primera cuenta bancaria o billetera para registrar movimientos.</p>
      <button class="btn btn-primary" @click="openNew"><Plus :size="17" /> Crear cuenta</button>
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
