import { Routes } from '@angular/router';
import { authenticationGuard } from './core/guards/authentication.guard';
import { ApplicationLayout } from './shared/layouts/application-layout/application-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authentication/login-page/login-page').then((m) => m.LoginPage)
  },
  {
    path: '',
    component: ApplicationLayout,
    // canActivate: [authenticationGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard-page/dashboard-page').then((m) => m.DashboardPage)
      }
    ]
  }
];
