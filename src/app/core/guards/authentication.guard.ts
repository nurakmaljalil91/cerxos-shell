import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

export const authenticationGuard: CanActivateFn = async (): Promise<boolean> => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authenticationService.isAuthenticated()) {
    await router.navigateByUrl('/login');
    return false;
  }

  return true;
};
