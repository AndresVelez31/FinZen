import { reactive, computed } from "vue"
import { seedUsers, seedAccounts, seedActivities, seedTransactions } from "@/data/seed"

const KEYS = {
  users: "finzen.co.users",
  accounts: "finzen.co.accounts",
  activities: "finzen.co.activities",
  transactions: "finzen.co.transactions",
  session: "finzen.co.session",
  theme: "finzen.co.theme",
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function persist(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Bootstrap on first run
if (!localStorage.getItem(KEYS.users)) persist(KEYS.users, seedUsers)
if (!localStorage.getItem(KEYS.accounts)) persist(KEYS.accounts, seedAccounts)
if (!localStorage.getItem(KEYS.activities)) persist(KEYS.activities, seedActivities)
if (!localStorage.getItem(KEYS.transactions)) persist(KEYS.transactions, seedTransactions)

const uid = () => Math.random().toString(36).slice(2, 10)

export const store = reactive({
  users: load(KEYS.users, seedUsers),
  accounts: load(KEYS.accounts, seedAccounts),
  activities: load(KEYS.activities, seedActivities),
  transactions: load(KEYS.transactions, seedTransactions),
  session: load(KEYS.session, null),
  theme: load(KEYS.theme, "light"),
})

/* ---------------- Theme ---------------- */
export function applyTheme() {
  document.documentElement.classList.toggle("dark", store.theme === "dark")
}
export function toggleTheme() {
  store.theme = store.theme === "dark" ? "light" : "dark"
  persist(KEYS.theme, store.theme)
  applyTheme()
}

/* ---------------- Auth ---------------- */
export function login(email, password) {
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  )
  if (!user) return { ok: false, error: "Credenciales incorrectas." }
  if (!user.active) return { ok: false, error: "Esta cuenta está desactivada." }
  const session = { id: user.id, name: user.name, email: user.email, role: user.role }
  store.session = session
  persist(KEYS.session, session)
  return { ok: true, user: session }
}

export function logout() {
  store.session = null
  localStorage.removeItem(KEYS.session)
}

export const currentUser = computed(() => store.session)
export const isAdmin = computed(() => store.session?.role === "admin")

/* ---------------- Scoped selectors ----------------
   Data belongs to the demo "user" account (u2) so every
   logged-in user sees a populated workspace. */
const DATA_OWNER = "u2"

export const myAccounts = computed(() => store.accounts.filter((a) => a.userId === DATA_OWNER))
export const myActivities = computed(() => store.activities.filter((a) => a.userId === DATA_OWNER))
export const myTransactions = computed(() =>
  store.transactions
    .filter((t) => t.userId === DATA_OWNER)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date)),
)

/* ---------------- CRUD: Transactions ---------------- */
export function saveTransaction(tx) {
  if (tx.id) {
    const i = store.transactions.findIndex((t) => t.id === tx.id)
    if (i !== -1) store.transactions[i] = { ...store.transactions[i], ...tx }
  } else {
    store.transactions.push({ ...tx, id: uid(), userId: DATA_OWNER })
  }
  persist(KEYS.transactions, store.transactions)
}
export function deleteTransaction(id) {
  store.transactions = store.transactions.filter((t) => t.id !== id)
  persist(KEYS.transactions, store.transactions)
}

/* ---------------- CRUD: Accounts ---------------- */
export function saveAccount(acc) {
  if (acc.id) {
    const i = store.accounts.findIndex((a) => a.id === acc.id)
    if (i !== -1) store.accounts[i] = { ...store.accounts[i], ...acc }
  } else {
    store.accounts.push({ ...acc, id: uid(), userId: DATA_OWNER })
  }
  persist(KEYS.accounts, store.accounts)
}
export function deleteAccount(id) {
  store.accounts = store.accounts.filter((a) => a.id !== id)
  // Remove transactions tied to the deleted account
  store.transactions = store.transactions.filter((t) => t.accountId !== id)
  persist(KEYS.accounts, store.accounts)
  persist(KEYS.transactions, store.transactions)
}
export function accountTxCount(id) {
  return store.transactions.filter((t) => t.accountId === id).length
}

/* ---------------- CRUD: Activities ---------------- */
export function saveActivity(ac) {
  if (ac.id) {
    const i = store.activities.findIndex((a) => a.id === ac.id)
    if (i !== -1) store.activities[i] = { ...store.activities[i], ...ac }
  } else {
    store.activities.push({ ...ac, id: uid(), userId: DATA_OWNER })
  }
  persist(KEYS.activities, store.activities)
}
export function deleteActivity(id) {
  store.activities = store.activities.filter((a) => a.id !== id)
  persist(KEYS.activities, store.activities)
}

/* ---------------- CRUD: Users ---------------- */
export function updateUserRole(id, role) {
  const i = store.users.findIndex((u) => u.id === id)
  if (i !== -1) {
    store.users[i].role = role
    store.users[i].updatedAt = new Date().toISOString()
    persist(KEYS.users, store.users)
  }
}
export function toggleUserActive(id) {
  const i = store.users.findIndex((u) => u.id === id)
  if (i !== -1) {
    store.users[i].active = !store.users[i].active
    store.users[i].updatedAt = new Date().toISOString()
    persist(KEYS.users, store.users)
  }
}

/* ---------------- Helpers ---------------- */
export function accountBalance(accountId) {
  const acc = store.accounts.find((a) => a.id === accountId)
  if (!acc) return 0
  const delta = store.transactions
    .filter((t) => t.accountId === accountId)
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0)
  return acc.initialBalance + delta
}

export function totalBalance() {
  return myAccounts.value.reduce((sum, a) => sum + accountBalance(a.id), 0)
}

export function activityById(id) {
  return store.activities.find((a) => a.id === id)
}
export function accountById(id) {
  return store.accounts.find((a) => a.id === id)
}

export function formatMoney(n) {
  const num = Number(n) || 0
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(d) {
  try {
    return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d))
  } catch {
    return d
  }
}

export function monthKey(d) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
}

export function resetDemoData() {
  Object.values(KEYS).forEach((k) => {
    if (k !== KEYS.theme) localStorage.removeItem(k)
  })
  location.reload()
}
