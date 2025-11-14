import { Routes } from '@angular/router';
import { authenticationGuard } from './core/guards/authentication.guard';
import { ApplicationLayout } from './shared/layouts/application-layout/application-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authentication/pages/login-page/login-page').then((m) => m.LoginPage)
  },
  {
    path: '',
    component: ApplicationLayout,
    canActivate: [authenticationGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page').then((m) => m.ProfilePage)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page/settings-page').then((m) => m.SettingsPage)
      }
    ]
  }
];
