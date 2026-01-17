import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { authenticationInterceptor } from './authentication.interceptor';
import { TokenService } from '../services/token.service';
import { AuthenticationService } from '../services/authentication.service';
import { of, throwError } from 'rxjs';

describe('authenticationInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authenticationInterceptor(req, next));

  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let authServiceSpy: jasmine.SpyObj<Pick<AuthenticationService, 'refreshTokens' | 'logout'>>;

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj(TokenService, ['get']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['refreshTokens', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: AuthenticationService, useValue: authServiceSpy }
      ]
    });
  });

  it('should add Authorization header when token exists', (done) => {
    tokenServiceSpy.get.and.returnValue('test-token');

    const mockRequest = new HttpRequest('GET', '/test');

    const next: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.headers.has('Authorization')).toBeTrue();
      expect(req.headers.get('Authorization')).toBe('Bearer test-token');
      return of({} as HttpEvent<unknown>);
    };

    interceptor(mockRequest, next).subscribe(() => {
      done();
    });
  });

  it('should still call next when token service returns null', (done) => {
    tokenServiceSpy.get.and.returnValue(null);

    const mockRequest = new HttpRequest('GET', '/test');

    const next: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.headers.has('Authorization')).toBeFalse();
      return of({} as HttpEvent<unknown>);
    };

    interceptor(mockRequest, next).subscribe(() => {
      done();
    });
  });

  it('should refresh and retry when request returns 401', (done) => {
    tokenServiceSpy.get.and.returnValue('old-token');
    authServiceSpy.refreshTokens.and.returnValue(
      of({
        success: true,
        data: { token: 'new-token' }
      })
    );

    const mockRequest = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      const authHeader = req.headers.get('Authorization');
      if (authHeader === 'Bearer old-token') {
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
      expect(authHeader).toBe('Bearer new-token');
      return of({} as HttpEvent<unknown>);
    };

    interceptor(mockRequest, next).subscribe(() => {
      expect(authServiceSpy.refreshTokens).toHaveBeenCalled();
      done();
    });
  });

  it('should logout when refresh fails after 401', (done) => {
    tokenServiceSpy.get.and.returnValue('old-token');
    authServiceSpy.refreshTokens.and.returnValue(
      throwError(() => new Error('refresh failed'))
    );

    const mockRequest = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401 }));

    interceptor(mockRequest, next).subscribe({
      error: () => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
        done();
      }
    });
  });
});
