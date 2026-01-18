import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login-page';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    authenticationService = jasmine.createSpyObj('AuthenticationService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthenticationService, useValue: authenticationService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.value).toEqual({
      username: '',
      password: '',
      remember: true,
    });
  });

  it('should have disabled() = false initially', () => {
    expect(component.disabled()).toBeFalse();
  });

  it('should not call login if form is invalid', () => {
    component.form.patchValue({ username: '', password: '' });

    component.onSubmit();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authenticationService.login).not.toHaveBeenCalled();
  });

  it('should call authenticationService.login when form is valid', () => {
    authenticationService.login.and.returnValue(
      of({
        success: true,
        message: 'Login successful.',
        data: {
          token: 'abc',
          expiresAt: new Date(),
          refreshToken: 'refresh-abc',
          refreshTokenExpiresAt: new Date(),
        },
      }),
    );

    component.form.patchValue({
      username: 'admin',
      password: 'Admin123#',
    });

    component.onSubmit();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authenticationService.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'Admin123#',
    });
  });

  it('should navigate to / after successful login', () => {
    authenticationService.login.and.returnValue(
      of({
        success: true,
        message: 'Login successful.',
        data: {
          token: 'abc',
          expiresAt: new Date(),
          refreshToken: 'refresh-abc',
          refreshTokenExpiresAt: new Date(),
        },
      }),
    );

    component.form.patchValue({
      username: 'admin',
      password: 'Admin123#',
    });

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should show error message on login failure', () => {
    authenticationService.login.and.returnValue(
      throwError(() => ({
        error: { message: 'Invalid username or password.' },
      })),
    );

    component.form.patchValue({
      username: 'bad',
      password: 'wrong',
    });

    component.onSubmit();

    expect(component.error()).toBe('Invalid username or password.');
    expect(component.loading()).toBeFalse();
  });

  it('should fallback to generic error message on unknown error', () => {
    authenticationService.login.and.returnValue(throwError(() => ({})));

    component.form.patchValue({
      username: 'test',
      password: 'test',
    });

    component.onSubmit();

    expect(component.error()).toBe('Login failed. Please try again.');
  });

  it('should set loading=true while submitting', () => {
    authenticationService.login.and.returnValue(
      of({
        success: true,
        message: 'Login successful.',
        data: {
          token: 'abc',
          expiresAt: new Date(),
          refreshToken: 'refresh-abc',
          refreshTokenExpiresAt: new Date(),
        },
      }),
    );

    component.form.patchValue({
      username: 'user',
      password: 'pass',
    });

    component.onSubmit();

    // loading immediately true
    expect(component.loading()).toBeTrue();
  });

  it('should disable button when loading is true', () => {
    component.loading.set(true);
    expect(component.disabled()).toBeTrue();
  });
});
