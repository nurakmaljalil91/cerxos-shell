import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UserSessionService } from './user-session.service';
import { UserSessionMock } from './user-session.mock';
import { environment } from '../../../environments/environment';
import { BaseResponseOfUserSessionDto } from '../../shared/models/model';

describe('UserSessionService', () => {
  let service: UserSessionService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let userSessionMockSpy: jasmine.SpyObj<UserSessionMock>;
  let originalTestMode: boolean;

  beforeEach(() => {
    originalTestMode = environment.testMode;
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    userSessionMockSpy = jasmine.createSpyObj('UserSessionMock', ['getSession']);
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UserSessionMock, useValue: userSessionMockSpy },
      ],
    });
    service = TestBed.inject(UserSessionService);
  });

  afterEach(() => {
    environment.testMode = originalTestMode;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should hydrate session from localStorage', () => {
    const stored = {
      user: { username: 'cached' },
      roles: ['Admin'],
    };
    localStorage.setItem('user_session', JSON.stringify(stored));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UserSessionMock, useValue: userSessionMockSpy },
      ],
    });
    service = TestBed.inject(UserSessionService);

    expect(service.session()).toEqual(stored as any);
  });

  it('should refresh session using mock in test mode', (done) => {
    environment.testMode = true;
    const response: BaseResponseOfUserSessionDto = {
      success: true,
      data: {
        user: { username: 'admin' },
        roles: ['Admin'],
        permissions: ['users.read'],
        preferences: [{ key: 'theme', value: 'dark' }],
      },
    };
    userSessionMockSpy.getSession.and.returnValue(of(response));

    service.refresh().subscribe((result) => {
      expect(userSessionMockSpy.getSession).toHaveBeenCalled();
      expect(result).toEqual(response);
      expect(service.session()?.user?.username).toBe('admin');
      expect(service.hasRole('Admin')).toBeTrue();
      expect(service.hasPermission('users.read')).toBeTrue();
      expect(service.themeMode()).toBe('dark');
      done();
    });
  });

  it('should refresh session using HttpClient when not in test mode', (done) => {
    environment.testMode = false;
    const response: BaseResponseOfUserSessionDto = {
      success: true,
      data: {
        user: { username: 'user' },
      },
    };
    httpClientSpy.get.and.returnValue(of(response));

    service.refresh().subscribe((result) => {
      expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiBaseUrl}/api/userSession`);
      expect(result).toEqual(response);
      expect(service.session()?.user?.username).toBe('user');
      done();
    });
  });
});
