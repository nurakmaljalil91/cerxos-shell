import { Routes } from '@angular/router';
import { authenticationGuard } from './core/guards/authentication.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authentication/login-page/login-page').then((m) => m.LoginPage)
  },
  {
    path: 'dashboard',
    canActivate: [authenticationGuard],
    loadComponent: () =>
      import('./features/dashboard-page/dashboard-page').then((m) => m.DashboardPage)
  }
];
