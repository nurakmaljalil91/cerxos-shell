import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../shared/models/model';
import { AuthenticationMock } from './authentication.mock';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  http = inject(HttpClient);
  mock = inject(AuthenticationMock);
  tokenService = inject(TokenService);

  private _user = signal<LoginResponse | null>(null);
  user = this._user.asReadonly();
  authenticating = computed(() => !!this.tokenService.get());

  isAuthenticated(): boolean {
    return this.authenticating();
  }

  login(request: LoginRequest) {
    {
      if (environment.testMode) {
        return this.mock.login(request).pipe(
          tap((response) => {
            this.tokenService.set(response.token);
            this._user.set(response);
          })
        );
      }
      return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/login`, request).pipe(
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
