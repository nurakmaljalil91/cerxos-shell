import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BaseResponseOfLoginResponse,
  BaseResponseOfString,
  LoginCommand,
  RegisterCommand,
} from '../../shared/models/model';
import { AuthenticationMock } from './authentication.mock';
import { UserSessionService } from './user-session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  http = inject(HttpClient);
  mock = inject(AuthenticationMock);
  tokenService = inject(TokenService);
  userSessionService = inject(UserSessionService);
  authenticationEndpoint = `${environment.apiBaseUrl}/api/authentications`;

  private readonly _user = signal<BaseResponseOfLoginResponse | null>(null);
  user = this._user.asReadonly();
  readonly authenticating = computed(() => !!this.tokenService.get());
  private refreshInFlight: Observable<BaseResponseOfLoginResponse> | null = null;

  isAuthenticated(): boolean {
    return this.authenticating();
  }

  login(request: LoginCommand): Observable<BaseResponseOfLoginResponse> {
    {
      if (environment.testMode) {
        return this.mock.login(request).pipe(
          tap((response) => {
            this.storeTokens(response);
          }),
          switchMap((response) => this.refreshSession(response)),
        );
      }
      return this.http
        .post<BaseResponseOfLoginResponse>(`${this.authenticationEndpoint}/login`, request)
        .pipe(
          tap((response) => {
            this.storeTokens(response);
          }),
          switchMap((response) => this.refreshSession(response)),
        );
    }
  }

  refreshTokens(): Observable<BaseResponseOfLoginResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token is missing.'));
    }

    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    const request$ = (environment.testMode
      ? this.mock.refresh(refreshToken)
      : this.http.post<BaseResponseOfLoginResponse>(`${this.authenticationEndpoint}/refresh`, {
          refreshToken,
        })
    ).pipe(
      tap((response) => {
        this.storeTokens(response);
      }),
      finalize(() => {
        this.refreshInFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.refreshInFlight = request$;
    return request$;
  }

  register(request: RegisterCommand): Observable<BaseResponseOfString> {
    if (environment.testMode) {
      return this.mock.register(request);
    }
    return this.http.post<BaseResponseOfString>(`${this.authenticationEndpoint}/register`, request);
  }

  logout(): void {
    this.tokenService.clear();
    this._user.set(null);
    this.userSessionService.clear();
  }

  private storeTokens(response: BaseResponseOfLoginResponse): void {
    if (!response?.success) {
      return;
    }
    this.tokenService.set(response?.data?.token ?? '');
    if (response?.data?.refreshToken) {
      this.tokenService.setRefreshToken(response.data.refreshToken);
    }
    this._user.set(response);
  }

  private refreshSession(
    response: BaseResponseOfLoginResponse,
  ): Observable<BaseResponseOfLoginResponse> {
    if (!response?.success) {
      return of(response);
    }
    return this.userSessionService.refresh().pipe(
      map(() => response),
      catchError(() => of(response)),
    );
  }
}
