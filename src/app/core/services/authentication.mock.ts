import { LoginRequest, LoginResponse } from '../../shared/models/model';
import { Observable, throwError } from 'rxjs';

export class AuthenticationMock {
  login(request: LoginRequest) {
    if (request.username === 'test' && request.password === 'password') {
      const response: LoginResponse = {
        token: 'mock-jwt-token',
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
