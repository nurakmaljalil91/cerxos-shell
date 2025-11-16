import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { authenticationGuard } from './authentication.guard';
import { AuthenticationService } from '../services/authentication.service';

describe('authenticationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authenticationGuard(...guardParameters));

  let routerSpy: jasmine.SpyObj<Router>;
  let authenticationSpy: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
    authenticationSpy = jasmine.createSpyObj('AuthenticationService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerSpy },
        { provide: AuthenticationService, useValue: authenticationSpy }
      ]
    });
  });

  it('should allow activation when authenticated', async () => {
    authenticationSpy.isAuthenticated.and.returnValue(true);

    const result = await executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    );
    expect(result).toBeTrue();
    expect(authenticationSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  })

  it('should redirected to /login when not authenticated',async () => {
    authenticationSpy.isAuthenticated.and.returnValue(false);

    const result = await executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    );
    expect(result).toBeFalse();
    expect(authenticationSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
