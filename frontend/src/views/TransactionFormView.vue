<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ArrowLeft, TrendingUp, TrendingDown, Save } from "lucide-vue-next"
import { myTransactions, myActivities, myAccounts, saveTransaction, formatMoney } from "@/store"

const route = useRoute()
const router = useRouter()

const editing = computed(() => route.name === "transaction-edit")
const today = new Date().toISOString().slice(0, 10)

const form = ref({
  id: null,
  type: "expense",
  amount: "",
  accountId: "",
  activityId: "",
  date: today,
  description: "",
})
const errors = ref({})
const saving = ref(false)

onMounted(() => {
  if (editing.value) {
    const tx = myTransactions.value.find((t) => t.id === route.params.id)
    if (!tx) {
      router.replace({ name: "transactions" })
      return
    }
    form.value = { ...tx, amount: String(tx.amount) }
  } else {
    if (myAccounts.value[0]) form.value.accountId = myAccounts.value[0].id
    if (myActivities.value[0]) form.value.activityId = myActivities.value[0].id
  }
})

const filteredActivities = computed(() =>
  form.value.type === "income" ? myActivities.value : myActivities.value.filter((a) => a.type === "expense" || true),
)

function validate() {
  const e = {}
  const amt = Number(form.value.amount)
  if (!form.value.amount || isNaN(amt) || amt <= 0) e.amount = "Introduce un importe válido mayor que 0."
  if (!form.value.accountId) e.accountId = "Selecciona una cuenta."
  if (!form.value.activityId) e.activityId = "Selecciona una actividad."
  if (!form.value.date) e.date = "Selecciona una fecha."
  if (!form.value.description.trim()) e.description = "Añade una descripción."
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  await new Promise((r) => setTimeout(r, 400))
  saveTransaction({
    id: form.value.id,
    type: form.value.type,
    amount: Number(form.value.amount),
    accountId: form.value.accountId,
    activityId: form.value.activityId,
    date: form.value.date,
    description: form.value.description.trim(),
  })
  saving.value = false
  const Swal = (await import("sweetalert2")).default
  await Swal.fire({
    title: editing.value ? "Transacción actualizada" : "Transacción creada",
    icon: "success",
    timer: 1300,
    showConfirmButton: false,
  })
  router.push({ name: "transactions" })
}
</script>

<template>
  <div class="fade-up form-page">
    <button class="back" @click="router.back()"><ArrowLeft :size="17" /> Volver</button>
    <h2 class="page-title">{{ editing ? "Editar transacción" : "Nueva transacción" }}</h2>
    <p class="muted">Completa los datos del movimiento.</p>

    <form class="card form" @submit.prevent="submit">
      <!-- Type toggle -->
      <div class="field">
        <label>Tipo de movimiento</label>
        <div class="type-toggle">
          <button type="button" class="type-opt" :class="{ active: form.type === 'expense', expense: true }"
            @click="form.type = 'expense'">
            <TrendingDown :size="18" /> Gasto
          </button>
          <button type="button" class="type-opt" :class="{ active: form.type === 'income', income: true }"
            @click="form.type = 'income'">
            <TrendingUp :size="18" /> Ingreso
          </button>
        </div>
      </div>

      <!-- Amount -->
      <div class="field">
        <label for="amount">Importe</label>
        <div class="amount-wrap">
          <span class="currency">$</span>
          <input id="amount" class="input amount" v-model="form.amount" type="number" step="1000" min="0"
            placeholder="0" />
        </div>
        <span v-if="errors.amount" class="err">{{ errors.amount }}</span>
      </div>

      <div class="row-2">
        <div class="field">
          <label for="account">Cuenta</label>
          <select id="account" class="select" v-model="form.accountId">
            <option value="" disabled>Selecciona cuenta</option>
            <option v-for="a in myAccounts" :key="a.id" :value="a.id">{{ a.bank }} · {{ a.accountNumber }}</option>
          </select>
          <span v-if="errors.accountId" class="err">{{ errors.accountId }}</span>
        </div>

        <div class="field">
          <label for="activity">Actividad</label>
          <select id="activity" class="select" v-model="form.activityId">
            <option value="" disabled>Selecciona actividad</option>
            <option v-for="a in filteredActivities" :key="a.id" :value="a.id">
              {{ a.name }} ({{ a.type === "expense" ? "Gasto" : "Ahorro" }})
            </option>
          </select>
          <span v-if="errors.activityId" class="err">{{ errors.activityId }}</span>
        </div>
      </div>

      <div class="field">
        <label for="date">Fecha</label>
        <input id="date" class="input" type="date" v-model="form.date" />
        <span v-if="errors.date" class="err">{{ errors.date }}</span>
      </div>

      <div class="field">
        <label for="desc">Descripción</label>
        <textarea id="desc" class="input" rows="2" v-model="form.description"
          placeholder="Ej: Compra en supermercado"></textarea>
        <span v-if="errors.description" class="err">{{ errors.description }}</span>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-ghost" @click="router.push({ name: 'transactions' })">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <Save :size="17" /> {{ saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear transacción" }}
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
