import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UserSessionService } from '../services/user-session.service';

type AuthorizationGuardResult = boolean | UrlTree;

export const authorizationGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
): Promise<AuthorizationGuardResult> => canAccessRoute(route);

export const authorizationChildGuard: CanActivateChildFn = async (
  route: ActivatedRouteSnapshot,
): Promise<AuthorizationGuardResult> => canAccessRoute(route);

async function canAccessRoute(route: ActivatedRouteSnapshot): Promise<AuthorizationGuardResult> {
  const router = inject(Router);
  const userSessionService = inject(UserSessionService);
  const requiredRoles = getRequiredRoles(route);

  if (!requiredRoles.length) {
    return true;
  }

  if (!userSessionService.session()) {
    await firstValueFrom(userSessionService.refresh().pipe(catchError(() => of(null))));
  }

  if (userSessionService.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.createUrlTree(['/error'], {
    queryParams: {
      statusCode: 403,
      message: getForbiddenMessage(route),
    },
  });
}

function getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
  return route.pathFromRoot.flatMap((snapshot) => {
    const roles = snapshot.data['requiredRoles'];
    return Array.isArray(roles) ? roles : [];
  });
}

function getForbiddenMessage(route: ActivatedRouteSnapshot): string {
  for (let index = route.pathFromRoot.length - 1; index >= 0; index -= 1) {
    const message = route.pathFromRoot[index].data['forbiddenMessage'];
    if (typeof message === 'string' && !!message.trim()) {
      return message;
    }
  }

  return 'You do not have access to this page.';
}
