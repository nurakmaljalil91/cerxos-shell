import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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
      return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/login`, request).pipe(
        tap((response) => {
          this.tokenService.set(response.token);
          this._user.set(response);
        })
      );
    }
  }

  logout() {
    this.tokenService.clear();
    this._user.set(null);
  }
}
