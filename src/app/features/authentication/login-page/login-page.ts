import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../core/services/authentication.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  form = this.formBuilder.group({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    username: ['', [Validators.required, Validators.minLength(6)]],
    // eslint-disable-next-line @typescript-eslint/unbound-method
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true]
  });

  readonly disabled = computed(() => this.loading() || this.form.invalid);

  onSubmit() {
    if (!this.form.valid) return;
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        this.error.set(err.error?.message ?? 'Login failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
