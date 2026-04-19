import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { AuthenticationMock } from './authentication.mock';
import { environment } from '../../../environments/environment';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { BaseResponseOfLoginResponse, LoginCommand } from '../../shared/models/model';
import { of } from 'rxjs';
import { UserSessionService } from './user-session.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let tokenServiceSpy: jasmine.SpyObj<
    Pick<TokenService, 'get' | 'set' | 'setRefreshToken' | 'clear' | 'getRefreshToken'>
  >;
  let authenticationMockSpy: jasmine.SpyObj<Pick<AuthenticationMock, 'login' | 'refresh'>>;
  let userSessionServiceSpy: jasmine.SpyObj<Pick<UserSessionService, 'refresh' | 'clear'>>;
  let tokenState: WritableSignal<string | null>;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'get',
      'set',
      'setRefreshToken',
      'getRefreshToken',
      'clear',
    ]);
    tokenState = signal<string | null>(null);
    Object.defineProperty(tokenServiceSpy, 'token', {
      value: tokenState.asReadonly(),
    });
    tokenServiceSpy.set.and.callFake((token: string) => {
      tokenState.set(token);
    });
    tokenServiceSpy.clear.and.callFake(() => {
      tokenState.set(null);
    });
    authenticationMockSpy = jasmine.createSpyObj('AuthenticationMock', ['login', 'refresh']);
    userSessionServiceSpy = jasmine.createSpyObj('UserSessionService', ['refresh', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: AuthenticationMock, useValue: authenticationMockSpy },
        { provide: UserSessionService, useValue: userSessionServiceSpy },
      ],
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
    it('should return true when the token signal has a token', () => {
      tokenState.set('test-token');

      const result = service.isAuthenticated();

      expect(result).toBeTrue();
    });

    it('should return false when the token signal is null', () => {
      tokenState.set(null);

      const result = service.isAuthenticated();

      expect(result).toBeFalse();
    });

    it('should update authentication state after login stores a token', (done) => {
      environment.testMode = false;

      const request: LoginCommand = {
        username: 'user',
        password: 'password',
      };

      const response: BaseResponseOfLoginResponse = {
        success: true,
        data: {
          token: 'api-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        },
      };

      httpClientSpy.post.and.returnValue(of(response));
      userSessionServiceSpy.refresh.and.returnValue(of({ success: true }));

      expect(service.isAuthenticated()).toBeFalse();

      service.login(request).subscribe(() => {
        expect(service.isAuthenticated()).toBeTrue();
        done();
      });
    });

    it('should use AuthenticationMock and set token/user on login when in test mode', (done) => {
      environment.testMode = true;

      const mockRequest: LoginCommand = {
        username: 'admin',
        password: 'Admin123#',
      };

      const mockResponse: BaseResponseOfLoginResponse = {
        success: true,
        data: {
          token: 'mock-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        },
      };

      authenticationMockSpy.login.and.returnValue(of(mockResponse));
      userSessionServiceSpy.refresh.and.returnValue(of({ success: true }));
      service.login(mockRequest).subscribe((response) => {
        expect(authenticationMockSpy.login).toHaveBeenCalledWith(mockRequest);
        expect(tokenServiceSpy.set).toHaveBeenCalledWith('mock-token');
        expect(tokenServiceSpy.setRefreshToken).toHaveBeenCalledWith('refresh-token');
        expect(userSessionServiceSpy.refresh).toHaveBeenCalled();
        expect(response).toEqual(mockResponse);
        expect(service.user()).toEqual(mockResponse);
        done();
      });
    });

    it('should call HttpClient and set token/user when not in testMode', (done) => {
      environment.testMode = false;

      const request: LoginCommand = {
        username: 'user',
        password: 'password',
      };

      const response: BaseResponseOfLoginResponse = {
        success: true,
        data: {
          token: 'api-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        },
      };

      httpClientSpy.post.and.returnValue(of(response));
      userSessionServiceSpy.refresh.and.returnValue(of({ success: true }));

      service.login(request).subscribe((res) => {
        expect(httpClientSpy.post).toHaveBeenCalledWith(
          `${environment.apiBaseUrl}/api/authentications/login`,
          request,
        );
        expect(tokenServiceSpy.set).toHaveBeenCalledWith('api-token');
        expect(tokenServiceSpy.setRefreshToken).toHaveBeenCalledWith('refresh-token');
        expect(userSessionServiceSpy.refresh).toHaveBeenCalled();
        expect(res).toEqual(response);
        expect(service.user()).toEqual(response);
        done();
      });
    });

    it('should clear token and reset user on logout', () => {
      const privateService = service as unknown as {
        _user: WritableSignal<BaseResponseOfLoginResponse | null>;
      };
      privateService._user.set({
        token: 'existing-token',
      } as BaseResponseOfLoginResponse);

      service.logout();

      expect(tokenServiceSpy.clear).toHaveBeenCalled();
      expect(userSessionServiceSpy.clear).toHaveBeenCalled();
      expect(service.user()).toBeNull();
    });
  });

  describe('refreshTokens', () => {
    it('should call refresh endpoint and store tokens', (done) => {
      environment.testMode = false;
      tokenServiceSpy.getRefreshToken.and.returnValue('refresh-token');

      const response: BaseResponseOfLoginResponse = {
        success: true,
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh',
          expiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        },
      };

      httpClientSpy.post.and.returnValue(of(response));

      service.refreshTokens().subscribe((result) => {
        expect(httpClientSpy.post).toHaveBeenCalledWith(
          `${environment.apiBaseUrl}/api/authentications/refresh`,
          { refreshToken: 'refresh-token' },
        );
        expect(tokenServiceSpy.set).toHaveBeenCalledWith('new-token');
        expect(tokenServiceSpy.setRefreshToken).toHaveBeenCalledWith('new-refresh');
        expect(result).toEqual(response);
        done();
      });
    });

    it('should error when refresh token is missing', (done) => {
      tokenServiceSpy.getRefreshToken.and.returnValue(null);

      service.refreshTokens().subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });
    });

    it('should use AuthenticationMock when in test mode', (done) => {
      environment.testMode = true;
      tokenServiceSpy.getRefreshToken.and.returnValue('refresh-token');

      const response: BaseResponseOfLoginResponse = {
        success: true,
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh',
          expiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        },
      };

      authenticationMockSpy.refresh.and.returnValue(of(response));

      service.refreshTokens().subscribe((result) => {
        expect(authenticationMockSpy.refresh).toHaveBeenCalledWith('refresh-token');
        expect(tokenServiceSpy.set).toHaveBeenCalledWith('new-token');
        expect(tokenServiceSpy.setRefreshToken).toHaveBeenCalledWith('new-refresh');
        expect(result).toEqual(response);
        done();
      });
    });
  });
});
