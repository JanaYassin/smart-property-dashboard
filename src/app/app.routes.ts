import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register-page.component').then(
            (m) => m.RegisterPageComponent
          )
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page.component').then((m) => m.DashboardPageComponent)
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./features/properties/pages/properties-page.component').then((m) => m.PropertiesPageComponent)
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./features/tenants/pages/tenants-page.component').then((m) => m.TenantsPageComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/pages/payments-page.component').then((m) => m.PaymentsPageComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
