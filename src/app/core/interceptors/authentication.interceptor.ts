import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { TokenService } from '../services/token.service';

export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  const token = tokenService.get();

  const authRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  if (request.url.includes('/api/authentications/refresh')) {
    return next(authRequest);
  }

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return authService.refreshTokens().pipe(
        switchMap((response) => {
          const nextToken = response?.data?.token;
          if (!nextToken) {
            authService.logout();
            return throwError(() => error);
          }

          return next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${nextToken}`,
              },
            }),
          );
        }),
        catchError((refreshError) => {
          authService.logout();
          if (!router.url.includes('/login')) {
            void router.navigate(['/login'], {
              queryParams: { reason: 'session-expired' },
            });
          }
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
