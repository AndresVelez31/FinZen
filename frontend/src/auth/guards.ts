// External imports
import type { NavigationGuardWithThis } from 'vue-router';

// Internal imports
import { AuthService } from '@/services/AuthService.js';

// Exports
// Redirects an already-authenticated user away from /login and /register, sends an
// unauthenticated one to /login for any non-public route, and otherwise lets
// navigation through.
export const authGuard: NavigationGuardWithThis<undefined> = (to) => {
  const authenticated = AuthService.isAuthenticated();

  if ((to.name === 'login' || to.name === 'register') && authenticated) {
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
