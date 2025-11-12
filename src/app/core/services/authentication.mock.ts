import { LoginRequest, LoginResponse } from '../../shared/models/model';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationMock {
  login(request: LoginRequest) {
    if (request.username === 'test' && request.password === 'password') {
      const response: LoginResponse = {
        token:
          'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzYyOTU1NjUxLCJpYXQiOjE3NjI5NTU2NTF9.DjZ1QgrbCxIXoBZt6-HF91ywW4q1V4FL2ZxR4CD6Fjk',
        expiresIn: 3600
      };
      return new Observable<LoginResponse>((observer) => {
        setTimeout(() => {
          observer.next(response);
          observer.complete();
        }, 500);
      });
    } else {
      return throwError(() => ({
        error: { message: 'Invalid username or password.' }
      }));
    }
  }
}
