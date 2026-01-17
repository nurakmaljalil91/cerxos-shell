import {
  BaseResponseOfLoginResponse,
  BaseResponseOfString,
  LoginCommand,
  RegisterCommand,
} from '../../shared/models/model';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationMock {
  login(request: LoginCommand): Observable<BaseResponseOfLoginResponse> {
    if (request.username === 'admin' && request.password === 'Admin123#') {
      const response: BaseResponseOfLoginResponse = {
        success: true,
        message: 'Login successful.',
        data: {
          token:
            // eslint-disable-next-line max-len
            'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzYyOTU1NjUxLCJpYXQiOjE3NjI5NTU2NTF9.DjZ1QgrbCxIXoBZt6-HF91ywW4q1V4FL2ZxR4CD6Fjk',
          expiresAt: new Date(),
          refreshToken: 'mock-refresh-token',
          refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      };
      return new Observable<BaseResponseOfLoginResponse>((observer) => {
        setTimeout(() => {
          observer.next(response);
          observer.complete();
        }, 500);
      });
    } else {
      return throwError(() => ({
        error: { message: 'Invalid username or password.' },
      }));
    }
  }

  refresh(refreshToken: string): Observable<BaseResponseOfLoginResponse> {
    if (!refreshToken) {
      return throwError(() => ({
        error: { message: 'Invalid refresh token.' },
      }));
    }

    const response: BaseResponseOfLoginResponse = {
      success: true,
      message: 'Token refreshed.',
      data: {
        token:
          // eslint-disable-next-line max-len
          'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiVXNlciIsImlzcyI6Iklzc3VlciIsInVzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE3NjI5NTU2NTEsImlhdCI6MTc2Mjk1NTY1MX0.5L8M7_DvMBg5n4xY0s_8lP4u9Pp6WIFC7pTUy3S5GJI',
        expiresAt: new Date(),
        refreshToken: 'mock-refresh-token-rotated',
        refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    };

    return new Observable<BaseResponseOfLoginResponse>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 400);
    });
  }

  register(request: RegisterCommand): Observable<BaseResponseOfString> {
    const response: BaseResponseOfString = {
      success: true,
      message: `Welcome, ${request.username ?? 'user'}! Your account is ready.`,
    };
    return new Observable<BaseResponseOfString>((observer) => {
      setTimeout(() => {
        observer.next(response);
        observer.complete();
      }, 500);
    });
  }
}
