import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { UserService } from '@/services/UserService.js';

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
    meta: {
      title: 'Iniciar sesión | FinZen',
      public: true,
      layout: 'blank',
    },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      title: 'Resumen | FinZen',
    },
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('@/views/TransactionsShowView.vue'),
    meta: { title: 'Transacciones | FinZen' },
  },
  {
    path: '/transactions/new',
    name: 'transaction-new',
    component: () => import('@/views/TransactionFormView.vue'),
    meta: { title: 'Nueva transacción | FinZen' },
  },
  {
    path: '/transactions/:id/edit',
    name: 'transaction-edit',
    component: () => import('@/views/TransactionFormView.vue'),
    meta: { title: 'Editar transacción | FinZen' },
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/AccountsShowView.vue'),
    meta: { title: 'Cuentas | FinZen' },
  },
  {
    path: '/accounts/new',
    name: 'account-new',
    component: () => import('@/views/AccountFormView.vue'),
    meta: { title: 'Nueva cuenta | FinZen' },
  },
  {
    path: '/accounts/:id/edit',
    name: 'account-edit',
    component: () => import('@/views/AccountFormView.vue'),
    meta: { title: 'Editar cuenta | FinZen' },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { title: 'Reportes | FinZen' },
  },
  {
    path: '/activities',
    name: 'activities',
    component: () => import('@/views/ActivitiesShowView.vue'),
    meta: { title: 'Actividades | FinZen', admin: true },
  },
  {
    path: '/activities/new',
    name: 'activity-new',
    component: () => import('@/views/ActivityFormView.vue'),
    meta: { title: 'Nueva actividad | FinZen', admin: true },
  },
  {
    path: '/activities/:id/edit',
    name: 'activity-edit',
    component: () => import('@/views/ActivityFormView.vue'),
    meta: { title: 'Editar actividad | FinZen', admin: true },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersShowView.vue'),
    meta: {
      title: 'Usuarios | FinZen',
      admin: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const ROUTES_REQUIRING_ID: Record<string, string> = {
  'transaction-edit': 'transactions',
  'account-edit': 'accounts',
  'activity-edit': 'activities',
};

router.beforeEach((to) => {
  if (typeof to.meta.title === 'string') {
    document.title = to.meta.title;
  }

  // Validar parámetro :id para rutas de edición
  const fallback = ROUTES_REQUIRING_ID[String(to.name)];
  if (fallback && !to.params.id) {
    return { name: fallback };
  }

  const authenticated = UserService.isAuthenticated();

  // Si ya está autenticado e intenta ir a login -> Dashboard
  if (to.name === 'login' && authenticated) {
    return { name: 'dashboard' };
  }

  // Si la ruta es pública -> Permitir
  if (to.meta.public) {
    return true;
  }

  // Si no está autenticado -> Login
  if (!authenticated) {
    return { name: 'login' };
  }

  // Si la ruta es admin y el usuario no es admin -> Dashboard
  const currentUser = UserService.getCurrentUser();
  if (to.meta.admin && currentUser?.role !== 'admin') {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
