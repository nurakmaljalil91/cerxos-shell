import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BaseResponseOfUserSessionDto,
  UserPreferenceDto,
  UserSessionDto,
} from '../../shared/models/model';
import { UserSessionMock } from './user-session.mock';
import { TokenService } from './token.service';

type ThemeMode = 'light' | 'dark' | 'system';

const USER_SESSION_KEY = 'user_session';
const THEME_PREFERENCE_KEY = 'theme';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private http = inject(HttpClient);
  private mock = inject(UserSessionMock);
  private tokenService = inject(TokenService);
  private userSessionEndpoint = `${environment.apiBaseUrl}/api/userSession`;

  private readonly _session = signal<UserSessionDto | null>(null);
  readonly session = this._session.asReadonly();

  readonly themeMode = computed<ThemeMode>(() => {
    const value = this.getPreference(THEME_PREFERENCE_KEY);
    if (!value) {
      return 'light';
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === 'dark' || normalized === 'light' || normalized === 'system') {
      return normalized as ThemeMode;
    }
    return 'light';
  });

  initialize(): void {
    this.hydrate();
    if (this.tokenService.get()) {
      this.refresh().subscribe({ error: () => undefined });
    }
  }

  refresh(): Observable<BaseResponseOfUserSessionDto> {
    const request$ = environment.testMode
      ? this.mock.getSession()
      : this.http.get<BaseResponseOfUserSessionDto>(this.userSessionEndpoint);

    return request$.pipe(
      tap((response) => {
        if (response?.success && response.data) {
          this.setSession(response.data);
        }
      }),
    );
  }

  clear(): void {
    localStorage.removeItem(USER_SESSION_KEY);
    this._session.set(null);
  }

  hasRole(role: string): boolean {
    const roles = this.session()?.roles ?? [];
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    const permissions = this.session()?.permissions ?? [];
    return permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  getPreference(key: string): string | null {
    const preferences = this.session()?.preferences ?? [];
    const match = preferences.find((preference) => preference.key === key);
    return match?.value ?? null;
  }

  private hydrate(): void {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) {
      return;
    }
    try {
      const data = JSON.parse(raw) as UserSessionDto;
      this._session.set(data);
    } catch {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  }

  private setSession(data: UserSessionDto): void {
    const cleaned = this.cleanPreferences(data);
    this._session.set(cleaned);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(cleaned));
  }

  private cleanPreferences(data: UserSessionDto): UserSessionDto {
    if (!data.preferences?.length) {
      return data;
    }

    const normalized = data.preferences.filter((preference): preference is UserPreferenceDto => {
      return !!preference?.key;
    });

    if (normalized.length === data.preferences.length) {
      return data;
    }

    return {
      ...data,
      preferences: normalized,
    };
  }
}
