import { Routes } from '@angular/router';
import { authenticationGuard } from './core/guards/authentication.guard';
import { ApplicationLayout } from './shared/layouts/application-layout/application-layout';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authentication/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/authentication/pages/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    component: ApplicationLayout,
    canActivate: [authenticationGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'identity',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'users',
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/users/pages/users-page/users-page').then((m) => m.UsersPage),
          },
          {
            path: 'groups',
            loadComponent: () =>
              import('./features/identity/pages/groups-page/groups-page').then(
                (m) => m.GroupsPage,
              ),
          },
          {
            path: 'roles',
            loadComponent: () =>
              import('./features/identity/pages/roles-page/roles-page').then((m) => m.RolesPage),
          },
          {
            path: 'permissions',
            loadComponent: () =>
              import('./features/identity/pages/permissions-page/permissions-page').then(
                (m) => m.PermissionsPage,
              ),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page/settings-page').then(
            (m) => m.SettingsPage,
          ),
      },
      {
        path: 'planning',
        loadChildren: () =>
          loadRemoteModule('planning-mfe', './Routes').then((m) => m.PLANNING_ROUTES),
      },
    ],
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import('./shared/pages/maintenance-page/maintenance-page').then((m) => m.MaintenancePage),
  },
  {
    path: 'coming-soon',
    loadComponent: () =>
      import('./shared/pages/coming-soon-page/coming-soon-page').then((m) => m.ComingSoonPage),
  },
  {
    path: 'error',
    loadComponent: () => import('./shared/pages/error-page/error-page').then((m) => m.ErrorPage),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/error-page/error-page').then((m) => m.ErrorPage),
  },
];
