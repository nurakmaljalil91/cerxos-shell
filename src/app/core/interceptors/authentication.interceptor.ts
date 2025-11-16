import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(TokenService);
  if (!token) {
    return next(request);
  }
  const cloneRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token.get()}`,
    },
  });
  return next(cloneRequest);
};
