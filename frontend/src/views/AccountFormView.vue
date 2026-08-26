<script setup>
import { ref, reactive, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ArrowLeft, Save, Landmark, PiggyBank, Wallet, Smartphone } from "lucide-vue-next"
import { myAccounts, saveAccount } from "@/store"

const route = useRoute()
const router = useRouter()

const TYPES = [
  { value: "checking", label: "Corriente", icon: Landmark },
  { value: "savings", label: "Ahorros", icon: PiggyBank },
  { value: "cash", label: "Efectivo", icon: Wallet },
  { value: "digital", label: "Digital", icon: Smartphone },
]

const editing = ref(false)
const form = reactive({ id: null, bank: "", type: "checking", accountNumber: "", initialBalance: "" })
const errors = ref({})
const saving = ref(false)

onMounted(() => {
  if (route.name === "account-edit") {
    const acc = myAccounts.value.find((a) => a.id === route.params.id)
    if (!acc) {
      router.replace({ name: "accounts" })
      return
    }
    editing.value = true
    Object.assign(form, {
      id: acc.id,
      bank: acc.bank,
      type: acc.type,
      accountNumber: acc.accountNumber,
      initialBalance: String(acc.initialBalance),
    })
  }
})

function validate() {
  const e = {}
  if (!form.bank.trim()) e.bank = "El nombre del banco es obligatorio."
  if (!form.accountNumber.trim()) e.accountNumber = "Añade una identificación de la cuenta."
  const amt = Number(form.initialBalance)
  if (form.initialBalance === "" || isNaN(amt)) e.initialBalance = "Introduce un saldo inicial válido."
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  await new Promise((r) => setTimeout(r, 400))
  saveAccount({
    id: form.id,
    bank: form.bank.trim(),
    type: form.type,
    accountNumber: form.accountNumber.trim(),
    initialBalance: Number(form.initialBalance),
  })
  saving.value = false
  const Swal = (await import("sweetalert2")).default
  await Swal.fire({
    title: editing.value ? "Cuenta actualizada" : "Cuenta creada",
    icon: "success",
    timer: 1300,
    showConfirmButton: false,
  })
  router.push({ name: "accounts" })
}
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" @click="router.back()"><ArrowLeft :size="17" /> Volver</button>
    <h2 class="page-title">{{ editing ? "Editar cuenta" : "Nueva cuenta" }}</h2>
    <p class="muted">Completa los datos de la cuenta bancaria, efectivo o billetera.</p>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <label for="bank">Banco / Entidad</label>
        <input id="bank" class="input" v-model="form.bank" placeholder="Ej: Bancolombia" />
        <span v-if="errors.bank" class="err">{{ errors.bank }}</span>
      </div>

      <div class="field">
        <label>Tipo de cuenta</label>
        <div class="type-grid">
          <button v-for="t in TYPES" :key="t.value" type="button" class="type-opt"
            :class="{ active: form.type === t.value }" @click="form.type = t.value">
            <component :is="t.icon" :size="17" /> {{ t.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <label for="number">Número / Identificación</label>
        <input id="number" class="input" v-model="form.accountNumber" placeholder="Ej: **** 4821 o @usuario" />
        <span v-if="errors.accountNumber" class="err">{{ errors.accountNumber }}</span>
      </div>

      <div class="field">
        <label for="balance">Saldo inicial</label>
        <div class="amount-wrap">
          <span class="currency">$</span>
          <input id="balance" class="input amount" v-model="form.initialBalance" type="number" step="1000"
            placeholder="0" />
        </div>
        <span v-if="errors.initialBalance" class="err">{{ errors.initialBalance }}</span>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-ghost" @click="router.push({ name: 'accounts' })">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <Save :size="17" /> {{ saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear cuenta" }}
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
  gap: 8px;
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
}
</style>
