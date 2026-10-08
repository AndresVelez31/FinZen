// External imports
import { createRouter, createWebHistory } from 'vue-router';

// Internal imports
import { adminGuard, authGuard } from '@/auth/guards.js';
import AccountFormView from '@/views/AccountFormView.vue';
import AccountsShowView from '@/views/AccountsShowView.vue';
import ActivitiesShowView from '@/views/ActivitiesShowView.vue';
import ActivityFormView from '@/views/ActivityFormView.vue';
import OverviewView from '@/views/OverviewView.vue';
import ReportsView from '@/views/ReportsView.vue';
import SignInView from '@/views/SignInView.vue';
import SignUpView from '@/views/SignUpView.vue';
import TransactionFormView from '@/views/TransactionFormView.vue';
import TransactionsShowView from '@/views/TransactionsShowView.vue';
import UsersShowView from '@/views/UsersShowView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    public?: boolean;
    admin?: boolean;
    layout?: 'auth';
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/sign-in',
      name: 'sign-in',
      component: SignInView,
      meta: {
        title: 'Iniciar sesión | FinZen',
        public: true,
        layout: 'auth',
      },
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUpView,
      meta: {
        title: 'Crear cuenta | FinZen',
        public: true,
        layout: 'auth',
      },
    },
    // Old URLs keep working
    { path: '/login', redirect: { name: 'sign-in' } },
    { path: '/register', redirect: { name: 'sign-up' } },
    {
      path: '/',
      name: 'overview',
      component: OverviewView,
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
      meta: { title: 'Actividades | FinZen' },
    },
    {
      path: '/activities/new',
      name: 'activities.create',
      component: ActivityFormView,
      meta: { title: 'Nueva actividad | FinZen' },
    },
    {
      path: '/activities/:id/edit',
      name: 'activities.edit',
      component: ActivityFormView,
      meta: { title: 'Editar actividad | FinZen' },
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

  // Validate the :id param for edit routes
  const fallback = ROUTES_REQUIRING_ID[String(to.name)];
  if (fallback && !to.params.id) {
    return { name: fallback };
  }

  return true;
});

router.beforeEach(authGuard);
router.beforeEach(adminGuard);

// Exports
export default router;
