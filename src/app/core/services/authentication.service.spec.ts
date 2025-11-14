import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { AuthenticationMock } from './authentication.mock';
import { environment } from '../../../environments/environment';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoginRequest, LoginResponse } from '../../shared/models/model';
import { of } from 'rxjs';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let tokenServiceSpy: jasmine.SpyObj<Pick<TokenService, 'get' | 'set' | 'clear'>>;
  let authenticationMockSpy: jasmine.SpyObj<Pick<AuthenticationMock, 'login'>>;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['get', 'set', 'clear']);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    authenticationMockSpy = jasmine.createSpyObj('AuthenticationMock', ['login']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: AuthenticationMock, useValue: authenticationMockSpy }
      ]
    });
    service = TestBed.inject(AuthenticationService);
  });

  afterEach(() => {
    environment.testMode = originalTestMode;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should return true when tokenService.get return a token', () => {
      tokenServiceSpy.get.and.returnValue('test-token');

      const result = service.isAuthenticated();

      expect(tokenServiceSpy.get).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should return false when tokenService.get return null', () => {
      tokenServiceSpy.get.and.returnValue(null);

      const result = service.isAuthenticated();

      expect(tokenServiceSpy.get).toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it('should use AuthenticationMock and set token/user on login when in test mode', (done) => {
      environment.testMode = true;

      const mockRequest: LoginRequest = {
        username: 'admin',
        password: 'Admin123#'
      };

      const mockResponse: LoginResponse = {
        token: 'mock-token',
        expiresIn: 3600
      };

      authenticationMockSpy.login.and.returnValue(of(mockResponse));
      service.login(mockRequest).subscribe((response) => {
        expect(authenticationMockSpy.login).toHaveBeenCalledWith(mockRequest);
        expect(tokenServiceSpy.set).toHaveBeenCalledWith('mock-token');
        expect(response).toEqual(mockResponse);
        expect(service.user()).toEqual(mockResponse);
        done();
      });
    });

    it('should call HttpClient and set token/user when not in testMode', (done) => {
      environment.testMode = false;

      const request: LoginRequest = {
        username: 'user',
        password: 'password'
      };

      const response: LoginResponse = {
        token: 'api-token',
        expiresIn: 1800
      };

      httpClientSpy.post.and.returnValue(of(response));

      service.login(request).subscribe((res) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(httpClientSpy.post).toHaveBeenCalledWith(
          `${environment.apiBaseUrl}/login`,
          request
        );
        expect(tokenServiceSpy.set).toHaveBeenCalledWith('api-token');
        expect(res).toEqual(response);
        expect(service.user()).toEqual(response);
        done();
      });
    });

    it('should clear token and reset user on logout', () => {
      // Pretend user was logged in
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      (service as any)._user.set({
        token: 'existing-token',
        expiresIn: 100
      } as LoginResponse);

      service.logout();

      expect(tokenServiceSpy.clear).toHaveBeenCalled();
      expect(service.user()).toBeNull();
    });
  });
});
