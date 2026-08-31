import { createRouter, createWebHistory } from 'vue-router';
import { UserService } from '@/services/UserService.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        public: true,
        layout: 'blank',
        title: 'Iniciar sesión | FinZen',
      },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        title: 'Dashboard | FinZen',
      },
    },
  ],
});

router.beforeEach((to) => {
  if (typeof to.meta.title === 'string') {
    document.title = to.meta.title;
  }

  if (to.name === 'login' && UserService.isAuthenticated()) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;