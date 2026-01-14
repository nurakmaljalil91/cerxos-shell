import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import {
  CxsAlertComponent,
  CxsButtonComponent,
  CxsCardComponent,
  CxsCheckboxComponent,
  CxsInputComponent
} from 'cerxos-ui';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    CxsAlertComponent,
    CxsButtonComponent,
    CxsCardComponent,
    CxsCheckboxComponent,
    CxsInputComponent
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  form = this.formBuilder.group({

    username: ['', [Validators.required]],

    password: ['', [Validators.required]],
    remember: [true],
  });

  readonly disabled = computed(() => this.loading());

  onSubmit(): void {
    if (!this.form.valid) {return;}
    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.form.getRawValue();
    if (!username || !password) {
      this.error.set('Username and password are required.');
      this.loading.set(false);
      return;
    }
    this.authenticationService.login({ username, password }).subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: (err) => {

        this.error.set(err.error?.message ?? 'Login failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
