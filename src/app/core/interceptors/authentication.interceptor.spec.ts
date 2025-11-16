import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { authenticationInterceptor } from './authentication.interceptor';
import { TokenService } from '../services/token.service';
import { of } from 'rxjs';

describe('authenticationInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authenticationInterceptor(req, next));

  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj(TokenService, ['get']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TokenService, useValue: tokenServiceSpy }
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
      expect(req.headers.get('Authorization')).toBe('Bearer null');
      return of({} as HttpEvent<unknown>);
    };

    interceptor(mockRequest, next).subscribe(() => {
      done();
    });
  });
});
