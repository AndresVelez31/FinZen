import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import TransactionsShowView from '@/views/TransactionsShowView.vue';
import TransactionFormView from '@/views/TransactionFormView.vue';
import AccountsShowView from '@/views/AccountsShowView.vue';
import AccountFormView from '@/views/AccountFormView.vue';
import ReportsView from '@/views/ReportsView.vue';
import ActivitiesShowView from '@/views/ActivitiesShowView.vue';
import ActivityFormView from '@/views/ActivityFormView.vue';
import UsersShowView from '@/views/UsersShowView.vue';
import { UserService } from '@/services/UserService.js';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    public?: boolean;
    admin?: boolean;
    layout?: 'blank';
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Iniciar sesión | FinZen',
        public: true,
        layout: 'blank',
      },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: 'Resumen | FinZen',
      },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsShowView,
      meta: { title: 'Transacciones | FinZen' },
    },
    {
      path: '/transactions/new',
      name: 'transactions.create',
      component: TransactionFormView,
      meta: { title: 'Nueva transacción | FinZen' },
    },
    {
      path: '/transactions/:id/edit',
      name: 'transactions.edit',
      component: TransactionFormView,
      meta: { title: 'Editar transacción | FinZen' },
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsShowView,
      meta: { title: 'Cuentas | FinZen' },
    },
    {
      path: '/accounts/new',
      name: 'accounts.create',
      component: AccountFormView,
      meta: { title: 'Nueva cuenta | FinZen' },
    },
    {
      path: '/accounts/:id/edit',
      name: 'accounts.edit',
      component: AccountFormView,
      meta: { title: 'Editar cuenta | FinZen' },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: { title: 'Reportes | FinZen' },
    },
    {
      path: '/activities',
      name: 'activities',
      component: ActivitiesShowView,
      meta: { title: 'Actividades | FinZen', admin: true },
    },
    {
      path: '/activities/new',
      name: 'activities.create',
      component: ActivityFormView,
      meta: { title: 'Nueva actividad | FinZen', admin: true },
    },
    {
      path: '/activities/:id/edit',
      name: 'activities.edit',
      component: ActivityFormView,
      meta: { title: 'Editar actividad | FinZen', admin: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersShowView,
      meta: {
        title: 'Usuarios | FinZen',
        admin: true,
      },
    },
  ],
});

const ROUTES_REQUIRING_ID: Record<string, string> = {
  'transactions.edit': 'transactions',
  'accounts.edit': 'accounts',
  'activities.edit': 'activities',
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
  const currentUser = UserService.getCurrent();
  if (to.meta.admin && currentUser?.role !== 'admin') {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
