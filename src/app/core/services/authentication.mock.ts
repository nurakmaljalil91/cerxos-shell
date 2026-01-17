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
