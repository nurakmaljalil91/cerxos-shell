import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPage } from './register-page';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { BaseResponseOfString } from '../../../../shared/models/model';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    authenticationService = jasmine.createSpyObj('AuthenticationService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthenticationService, useValue: authenticationService }
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.value).toEqual({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  });

  it('should not call register if form is invalid', () => {
    component.form.patchValue({ username: '', email: '', password: '', confirmPassword: '' });

    component.onSubmit();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authenticationService.register).not.toHaveBeenCalled();
  });

  it('should call authenticationService.register when form is valid', () => {
    const response: BaseResponseOfString = { success: true, message: 'ok' };
    authenticationService.register.and.returnValue(of(response));

    component.form.patchValue({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    component.onSubmit();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authenticationService.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password1!'
    });
  });

  it('should navigate to /login after successful registration', () => {
    authenticationService.register.and.returnValue(of({ success: true, message: 'ok' }));

    component.form.patchValue({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should show error message on registration failure', () => {
    authenticationService.register.and.returnValue(
      throwError(() => ({
        error: { message: 'Registration failed.' }
      }))
    );

    component.form.patchValue({
      username: 'bad',
      email: 'bad@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    component.onSubmit();

    expect(component.error()).toBe('Registration failed.');
    expect(component.loading()).toBeFalse();
  });
});
