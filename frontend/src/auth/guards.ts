import type { NavigationGuardWithThis } from 'vue-router';
import { AuthService } from '@/auth/AuthService.js';

// Redirects an already-authenticated user away from /login, sends an
// unauthenticated one there for any non-public route, and otherwise lets
// navigation through.
export const authGuard: NavigationGuardWithThis<undefined> = (to) => {
  const authenticated = AuthService.isAuthenticated();

  if (to.name === 'login' && authenticated) {
    return { name: 'overview' };
  }

  if (to.meta.public) {
    return true;
  }

  if (!authenticated) {
    return { name: 'login' };
  }

  return true;
};

// Sends a non-admin user back to the overview on any route flagged
// meta.admin. Runs after authGuard, so by the time this executes the user
// is either authenticated or already being redirected to /login.
export const adminGuard: NavigationGuardWithThis<undefined> = (to) => {
  if (to.meta.admin && !AuthService.isAdmin()) {
    return { name: 'overview' };
  }

  return true;
};
