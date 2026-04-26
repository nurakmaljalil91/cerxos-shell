import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authorizationChildGuard, authorizationGuard } from './authorization.guard';
import { UserSessionService } from '../services/user-session.service';

describe('authorizationGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let userSessionSpy: jasmine.SpyObj<
    Pick<UserSessionService, 'hasAnyRole' | 'refresh'> & { session: () => unknown }
  >;
  let forbiddenTree: UrlTree;

  beforeEach(() => {
    forbiddenTree = {} as UrlTree;
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(forbiddenTree);
    userSessionSpy = jasmine.createSpyObj('UserSessionService', [
      'session',
      'hasAnyRole',
      'refresh',
    ]);
    userSessionSpy.session.and.returnValue({ roles: ['Admin'] });
    userSessionSpy.refresh.and.returnValue(of({ success: true }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerSpy },
        { provide: UserSessionService, useValue: userSessionSpy },
      ],
    });
  });

  it('should allow routes without required roles', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      authorizationGuard(createRoute([]), {} as never),
    );

    expect(result).toBeTrue();
    expect(userSessionSpy.hasAnyRole).not.toHaveBeenCalled();
  });

  it('should allow Admin users to access protected routes', async () => {
    userSessionSpy.hasAnyRole.and.returnValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      authorizationGuard(createRoute(['Admin']), {} as never),
    );

    expect(result).toBeTrue();
    expect(userSessionSpy.hasAnyRole).toHaveBeenCalledWith(['Admin']);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('should block non-admin users from protected routes', async () => {
    userSessionSpy.hasAnyRole.and.returnValue(false);

    const result = await TestBed.runInInjectionContext(() =>
      authorizationGuard(createRoute(['Admin']), {} as never),
    );

    expect(result).toBe(forbiddenTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/error'], {
      queryParams: {
        statusCode: 403,
        message: 'You do not have access to this page.',
      },
    });
  });

  it('should use the configured forbidden message when provided', async () => {
    userSessionSpy.hasAnyRole.and.returnValue(false);

    const result = await TestBed.runInInjectionContext(() =>
      authorizationGuard(
        createRoute(['Admin'], 'You do not have access to Manage Calendar.'),
        {} as never,
      ),
    );

    expect(result).toBe(forbiddenTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/error'], {
      queryParams: {
        statusCode: 403,
        message: 'You do not have access to Manage Calendar.',
      },
    });
  });

  it('should refresh the session before checking roles when no session is loaded', async () => {
    userSessionSpy.session.and.returnValue(null);
    userSessionSpy.hasAnyRole.and.returnValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      authorizationChildGuard(createRoute(['Admin']), {} as never),
    );

    expect(result).toBeTrue();
    expect(userSessionSpy.refresh).toHaveBeenCalled();
  });

  it('should block protected routes when session refresh fails', async () => {
    userSessionSpy.session.and.returnValue(null);
    userSessionSpy.refresh.and.returnValue(throwError(() => new Error('refresh failed')));
    userSessionSpy.hasAnyRole.and.returnValue(false);

    const result = await TestBed.runInInjectionContext(() =>
      authorizationGuard(createRoute(['Admin']), {} as never),
    );

    expect(result).toBe(forbiddenTree);
  });
});

function createRoute(requiredRoles: string[], forbiddenMessage?: string): ActivatedRouteSnapshot {
  const data = {
    ...(requiredRoles.length ? { requiredRoles } : {}),
    ...(forbiddenMessage ? { forbiddenMessage } : {}),
  };

  return {
    data,
    pathFromRoot: [{ data }],
  } as unknown as ActivatedRouteSnapshot;
}
