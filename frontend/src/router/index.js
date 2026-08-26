import { createRouter, createWebHistory } from "vue-router"
import { store } from "@/store"

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { public: true, layout: "blank" },
  },
  {
    path: "/",
    name: "dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { title: "Resumen" },
  },
  {
    path: "/transactions",
    name: "transactions",
    component: () => import("@/views/TransactionsView.vue"),
    meta: { title: "Transacciones" },
  },
  {
    path: "/transactions/new",
    name: "transaction-new",
    component: () => import("@/views/TransactionFormView.vue"),
    meta: { title: "Nueva transacción" },
  },
  {
    path: "/transactions/:id/edit",
    name: "transaction-edit",
    component: () => import("@/views/TransactionFormView.vue"),
    meta: { title: "Editar transacción" },
  },
  {
    path: "/accounts",
    name: "accounts",
    component: () => import("@/views/AccountsView.vue"),
    meta: { title: "Cuentas" },
  },
  {
    path: "/accounts/new",
    name: "account-new",
    component: () => import("@/views/AccountFormView.vue"),
    meta: { title: "Nueva cuenta" },
  },
  {
    path: "/accounts/:id/edit",
    name: "account-edit",
    component: () => import("@/views/AccountFormView.vue"),
    meta: { title: "Editar cuenta" },
  },
  {
    path: "/activities",
    name: "activities",
    component: () => import("@/views/ActivitiesView.vue"),
    meta: { title: "Actividades", admin: true },
  },
  {
    path: "/users",
    name: "users",
    component: () => import("@/views/UsersView.vue"),
    meta: { title: "Usuarios", admin: true },
  },
  {
    path: "/reports",
    name: "reports",
    component: () => import("@/views/ReportsView.vue"),
    meta: { title: "Reportes" },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const session = store.session
  // Not logged in -> only public routes allowed
  if (!session && !to.meta.public) {
    return { name: "login" }
  }
  // Logged in trying to visit login -> go home
  if (session && to.name === "login") {
    return { name: "dashboard" }
  }
  // Admin-only guard
  if (to.meta.admin && session?.role !== "admin") {
    return { name: "dashboard" }
  }
  return true
})

export default router
