import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authenticationGuard } from './authentication.guard';
import { AuthenticationService } from '../services/authentication.service';

describe('authenticationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authenticationGuard(...guardParameters));

  let routerSpy: jasmine.SpyObj<Router>;
  let authenticationSpy: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authenticationSpy.isAuthenticated).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  })

  it('should redirected to /login when not authenticated',async () => {
    authenticationSpy.isAuthenticated.and.returnValue(false);

    const result = await executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    );
    expect(result).toBeFalse();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authenticationSpy.isAuthenticated).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
