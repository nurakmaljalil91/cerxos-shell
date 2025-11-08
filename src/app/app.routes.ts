import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authentication/login-page/login-page').then((m) => m.LoginPage)
  }
];
