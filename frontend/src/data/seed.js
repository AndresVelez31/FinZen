// Demo seed data used to bootstrap LocalStorage on first run.

const now = new Date()
const iso = (d) => d.toISOString()
const dayStr = (d) => d.toISOString().slice(0, 10)

function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return dayStr(d)
}

export const seedUsers = [
  {
    id: "u1",
    name: "Ana Martínez",
    email: "admin@finzen.app",
    password: "admin123",
    role: "admin",
    active: true,
    createdAt: iso(new Date(2024, 0, 12)),
    updatedAt: iso(new Date(2024, 0, 12)),
  },
  {
    id: "u2",
    name: "Diego Ramírez",
    email: "user@finzen.app",
    password: "user123",
    role: "user",
    active: true,
    createdAt: iso(new Date(2024, 2, 3)),
    updatedAt: iso(new Date(2024, 2, 3)),
  },
  {
    id: "u3",
    name: "Lucía Fernández",
    email: "lucia@finzen.app",
    password: "lucia123",
    role: "user",
    active: true,
    createdAt: iso(new Date(2024, 4, 20)),
    updatedAt: iso(new Date(2024, 4, 20)),
  },
  {
    id: "u4",
    name: "Carlos Ortega",
    email: "carlos@finzen.app",
    password: "carlos123",
    role: "user",
    active: false,
    createdAt: iso(new Date(2024, 6, 1)),
    updatedAt: iso(new Date(2024, 6, 1)),
  },
]

export const seedAccounts = [
  { id: "a1", userId: "u2", type: "checking", accountNumber: "**** 4821", bank: "Bancolombia", initialBalance: 3200000 },
  { id: "a2", userId: "u2", type: "savings", accountNumber: "**** 0093", bank: "Davivienda", initialBalance: 8500000 },
  { id: "a3", userId: "u2", type: "cash", accountNumber: "Efectivo", bank: "Billetera", initialBalance: 300000 },
  { id: "a4", userId: "u2", type: "digital", accountNumber: "@diego.pay", bank: "Nequi", initialBalance: 1200000 },
]

export const seedActivities = [
  { id: "ac1", userId: "u2", name: "Alimentación", color: "#10b981", type: "expense", targetAmount: 700000 },
  { id: "ac2", userId: "u2", name: "Transporte", color: "#0ea5e9", type: "expense", targetAmount: 250000 },
  { id: "ac3", userId: "u2", name: "Ocio", color: "#f59e0b", type: "expense", targetAmount: 300000 },
  { id: "ac4", userId: "u2", name: "Hogar", color: "#6366f1", type: "expense", targetAmount: 1500000 },
  { id: "ac5", userId: "u2", name: "Salud", color: "#ec4899", type: "expense", targetAmount: 200000 },
  { id: "ac6", userId: "u2", name: "Fondo emergencia", color: "#8b5cf6", type: "savings", targetAmount: 6000000 },
  { id: "ac7", userId: "u2", name: "Viaje Japón", color: "#14b8a6", type: "savings", targetAmount: 5000000 },
]

function buildTransactions() {
  const txs = []
  let counter = 1
  const push = (accountId, activityId, type, amount, date, description) => {
    txs.push({
      id: "t" + counter++,
      userId: "u2",
      accountId,
      activityId,
      type,
      amount,
      date,
      description,
    })
  }

  // Incomes
  push("a1", "ac6", "income", 3500000, daysAgo(2), "Salario mensual")
  push("a1", "ac6", "income", 3500000, daysAgo(33), "Salario mensual")
  push("a4", "ac7", "income", 800000, daysAgo(10), "Freelance diseño")

  // Current month expenses
  push("a1", "ac1", "expense", 185000, daysAgo(1), "Supermercado semanal")
  push("a3", "ac1", "expense", 28000, daysAgo(3), "Cafetería")
  push("a1", "ac2", "expense", 120000, daysAgo(4), "Gasolina")
  push("a4", "ac2", "expense", 90000, daysAgo(6), "Recarga transporte")
  push("a1", "ac3", "expense", 150000, daysAgo(5), "Cine + cena")
  push("a4", "ac3", "expense", 42000, daysAgo(8), "Streaming")
  push("a2", "ac4", "expense", 1400000, daysAgo(7), "Arriendo")
  push("a1", "ac4", "expense", 220000, daysAgo(9), "Luz y agua")
  push("a1", "ac5", "expense", 95000, daysAgo(11), "Farmacia")

  // Savings contributions
  push("a2", "ac6", "expense", 800000, daysAgo(2), "Aporte fondo emergencia")
  push("a2", "ac7", "expense", 500000, daysAgo(12), "Aporte viaje")

  // Previous months (for trend charts)
  for (let m = 1; m <= 5; m++) {
    const base = 28 + m * 30
    push("a1", "ac1", "expense", 620000 + m * 30000, daysAgo(base), "Alimentación mes -" + m)
    push("a1", "ac2", "expense", 210000 + m * 15000, daysAgo(base + 1), "Transporte mes -" + m)
    push("a1", "ac3", "expense", 260000 + m * 20000, daysAgo(base + 2), "Ocio mes -" + m)
    push("a2", "ac4", "expense", 1400000, daysAgo(base + 3), "Arriendo mes -" + m)
    push("a2", "ac6", "expense", 700000, daysAgo(base + 4), "Ahorro mes -" + m)
  }

  return txs
}

export const seedTransactions = buildTransactions()
