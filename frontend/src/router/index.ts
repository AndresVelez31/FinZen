import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { UserService } from '@/services/UserService';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    public?: boolean;
    admin?: boolean;
    layout?: 'blank';
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Iniciar sesión', public: true, layout: 'blank' },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Resumen' },
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('@/views/TransactionsView.vue'),
    meta: { title: 'Transacciones' },
  },
  {
    path: '/transactions/new',
    name: 'transaction-new',
    component: () => import('@/views/TransactionFormView.vue'),
    meta: { title: 'Nueva transacción' },
  },
  {
    path: '/transactions/:id/edit',
    name: 'transaction-edit',
    component: () => import('@/views/TransactionFormView.vue'),
    meta: { title: 'Editar transacción' },
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/AccountsView.vue'),
    meta: { title: 'Cuentas' },
  },
  {
    path: '/accounts/new',
    name: 'account-new',
    component: () => import('@/views/AccountFormView.vue'),
    meta: { title: 'Nueva cuenta' },
  },
  {
    path: '/accounts/:id/edit',
    name: 'account-edit',
    component: () => import('@/views/AccountFormView.vue'),
    meta: { title: 'Editar cuenta' },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { title: 'Reportes' },
  },
  {
    path: '/activities',
    name: 'activities',
    component: () => import('@/views/ActivitiesView.vue'),
    meta: { title: 'Actividades', admin: true },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { title: 'Usuarios', admin: true },
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

const ROUTES_REQUIRING_ID: Record<string, string> = {
  'transaction-edit': 'transactions',
  'account-edit': 'accounts',
};

   router.beforeEach((to) => {
  const fallback = ROUTES_REQUIRING_ID[String(to.name)];
  if (fallback && !to.params.id) {
    return { name: fallback };
  }

  if (to.meta.public) {
    return true;
  }

  const currentUser = UserService.getCurrentUser();
  if (!currentUser) {
    return { name: 'login' };
  }

  if (to.meta.admin && currentUser.role !== 'admin') {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;