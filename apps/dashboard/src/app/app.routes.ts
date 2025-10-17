import { Route } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'audit',
    loadComponent: () => import('./components/audit/audit.component').then(m => m.AuditComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'access-permissions',
    loadComponent: () => import('./components/access-permissions/access-permissions.component').then(m => m.AccessPermissionsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
