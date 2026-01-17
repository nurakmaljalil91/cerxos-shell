import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { CxsAlertComponent, CxsButtonComponent, CxsCardComponent, CxsInputComponent } from 'cerxos-ui';

@Component({
  selector: 'app-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    CxsAlertComponent,
    CxsButtonComponent,
    CxsCardComponent,
    CxsInputComponent
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  form = this.formBuilder.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  readonly disabled = computed(() => this.loading());

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password, confirmPassword } = this.form.getRawValue();
    if (!username || !email || !password) {
      this.error.set('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authenticationService.register({ username, email, password }).subscribe({
      next: (response) => {
        if (!response?.success) {
          this.error.set(response?.message ?? 'Registration failed. Please try again.');
          this.loading.set(false);
          return;
        }
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

}
