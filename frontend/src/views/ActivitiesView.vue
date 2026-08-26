<script setup>
import { ref, reactive, computed } from "vue"
import { Plus, Pencil, Trash2, Target, PiggyBank, X } from "lucide-vue-next"
import { myActivities, myTransactions, saveActivity, deleteActivity, formatMoney, monthKey } from "@/store"

const showModal = ref(false)
const editingId = ref(null)
const preset = ["#10b981", "#0ea5e9", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"]

const form = reactive({ name: "", color: "#10b981", type: "expense", targetAmount: "" })
const errors = ref({})

const nowKey = monthKey(new Date())

function spentThisMonth(activityId) {
  return myTransactions.value
    .filter((t) => t.activityId === activityId && t.type === "expense" && monthKey(t.date) === nowKey)
    .reduce((s, t) => s + t.amount, 0)
}
function savedTotal(activityId) {
  return myTransactions.value
    .filter((t) => t.activityId === activityId && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)
}

const cards = computed(() =>
  myActivities.value.map((a) => {
    const used = a.type === "expense" ? spentThisMonth(a.id) : savedTotal(a.id)
    const pct = a.targetAmount > 0 ? Math.min(100, Math.round((used / a.targetAmount) * 100)) : 0
    return { ...a, used, pct, over: a.type === "expense" && used > a.targetAmount }
  }),
)

function openNew() {
  editingId.value = null
  Object.assign(form, { name: "", color: "#10b981", type: "expense", targetAmount: "" })
  errors.value = {}
  showModal.value = true
}
function openEdit(a) {
  editingId.value = a.id
  Object.assign(form, { name: a.name, color: a.color, type: a.type, targetAmount: String(a.targetAmount) })
  errors.value = {}
  showModal.value = true
}

function validate() {
  const e = {}
  if (!form.name.trim()) e.name = "El nombre es obligatorio."
  const amt = Number(form.targetAmount)
  if (!form.targetAmount || isNaN(amt) || amt <= 0) e.targetAmount = "Introduce un monto válido."
  errors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  saveActivity({
    id: editingId.value,
    name: form.name.trim(),
    color: form.color,
    type: form.type,
    targetAmount: Number(form.targetAmount),
  })
  showModal.value = false
  const Swal = (await import("sweetalert2")).default
  Swal.fire({ title: editingId.value ? "Actividad actualizada" : "Actividad creada", icon: "success", timer: 1200, showConfirmButton: false })
}

async function remove(a) {
  const Swal = (await import("sweetalert2")).default
  const res = await Swal.fire({
    title: "¿Eliminar actividad?",
    html: `<b>${a.name}</b><br>Las transacciones asociadas no se eliminarán.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#94a3b8",
  })
  if (res.isConfirmed) {
    deleteActivity(a.id)
    Swal.fire({ title: "Eliminada", icon: "success", timer: 1100, showConfirmButton: false })
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

    <div v-if="cards.length" class="grid">
      <article v-for="a in cards" :key="a.id" class="card act" :style="{ '--c': a.color }">
        <div class="act-top">
          <span class="act-dot"></span>
          <div class="act-titles">
            <h3>{{ a.name }}</h3>
            <span class="badge" :class="a.type === 'expense' ? 'badge-red' : 'badge-green'">
              <component :is="a.type === 'expense' ? Target : PiggyBank" :size="12" />
              {{ a.type === "expense" ? "Gasto" : "Ahorro" }}
            </span>
          </div>
          <div class="act-actions">
            <button class="btn btn-ghost btn-icon" @click="openEdit(a)" aria-label="Editar"><Pencil :size="15" /></button>
            <button class="btn btn-danger btn-icon" @click="remove(a)" aria-label="Eliminar"><Trash2 :size="15" /></button>
          </div>
        </div>

        <div class="act-meta">
          <span class="soft">{{ a.type === "expense" ? "Presupuesto mensual" : "Meta de ahorro" }}</span>
          <strong>{{ formatMoney(a.targetAmount) }}</strong>
        </div>

        <div class="progress">
          <div class="bar"><span :style="{ width: a.pct + '%', background: a.over ? 'var(--danger)' : a.color }"></span></div>
          <div class="progress-foot">
            <span :class="{ over: a.over }">{{ formatMoney(a.used) }} {{ a.type === "expense" ? "gastado" : "ahorrado" }}</span>
            <span class="soft">{{ a.pct }}%</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="card empty-state">
      <div class="empty-icon"><Target :size="26" /></div>
      <h4>Aún no tienes actividades</h4>
      <p class="muted">Crea tu primera categoría de gasto o meta de ahorro.</p>
      <button class="btn btn-primary" @click="openNew"><Plus :size="17" /> Crear actividad</button>
    </div>

    <!-- Modal -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal card">
          <div class="modal-head">
            <h3>{{ editingId ? "Editar actividad" : "Nueva actividad" }}</h3>
            <button class="btn btn-ghost btn-icon" @click="showModal = false" aria-label="Cerrar"><X :size="18" /></button>
          </div>

          <div class="modal-body">
            <div class="field">
              <label>Nombre</label>
              <input class="input" v-model="form.name" placeholder="Ej: Alimentación" />
              <span v-if="errors.name" class="err">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label>Tipo</label>
              <div class="type-toggle">
                <button type="button" class="type-opt" :class="{ active: form.type === 'expense' }" @click="form.type = 'expense'">
                  <Target :size="16" /> Gasto
                </button>
                <button type="button" class="type-opt save" :class="{ active: form.type === 'savings' }" @click="form.type = 'savings'">
                  <PiggyBank :size="16" /> Ahorro
                </button>
              </div>
            </div>

            <div class="field">
              <label>{{ form.type === "expense" ? "Presupuesto mensual" : "Meta de ahorro" }}</label>
              <div class="amount-wrap">
                <span class="cur">$</span>
                <input class="input amt" v-model="form.targetAmount" type="number" min="0" step="1000" placeholder="0" />
              </div>
              <span v-if="errors.targetAmount" class="err">{{ errors.targetAmount }}</span>
            </div>

            <div class="field">
              <label>Color</label>
              <div class="colors">
                <button v-for="c in preset" :key="c" type="button" class="swatch" :class="{ sel: form.color === c }"
                  :style="{ background: c }" @click="form.color = c" :aria-label="c"></button>
                <input type="color" v-model="form.color" class="color-input" aria-label="Color personalizado" />
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
            <button class="btn btn-primary" @click="save">{{ editingId ? "Guardar" : "Crear" }}</button>
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}
.act {
  padding: 20px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.act:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.act-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.act-dot {
  width: 14px;
  height: 14px;
  border-radius: 5px;
  background: var(--c);
  margin-top: 4px;
  flex-shrink: 0;
}
.act-titles {
  flex: 1;
  min-width: 0;
}
.act-titles h3 {
  font-size: 1.05rem;
  margin-bottom: 6px;
}
.act-actions {
  display: flex;
  gap: 4px;
}
.act-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 10px;
}
.act-meta strong {
  font-family: var(--font-head);
  font-size: 1.15rem;
}
.bar {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.progress-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}
.progress-foot .over {
  color: var(--danger);
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
