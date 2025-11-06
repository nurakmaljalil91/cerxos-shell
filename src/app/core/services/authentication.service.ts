import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';

interface LoginRequest {
  username: string;
  password: string;
}
interface LoginResponse {
  token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  http = inject(HttpClient);
  tokenService = inject(TokenService);

  private _user = signal<LoginResponse | null>(null);
  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this.tokenService.get());

  login(request: LoginRequest) {
    {
      return this.http.post<LoginResponse>('/api/login', request).subscribe({
        next: (response) => {
          this.tokenService.set(response.token);
          this._user.set(response);
        },
        error: (error) => {
          console.error('Login failed', error);
        },
        complete: () => {
          console.log('Login request completed');
        }
      });
    }
  }

  logout() {
    this.tokenService.clear();
    this._user.set(null);
  }
}
