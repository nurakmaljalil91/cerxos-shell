import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private _token = signal<string | null>(this.get());
  token = this._token.asReadonly();

  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._token.set(null);
  }
}
