import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.hasActiveSession();
  if (isAuthenticated) {
    return true;
  }

  const attemptedPath = encodeURIComponent(state.url);
  return router.createUrlTree(['/auth/login'], {
    queryParams: { redirectTo: attemptedPath }
  });
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
