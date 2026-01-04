
import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './features/landing/home.component';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const appRoutes: Route[] = [
    // Landing Page (No Layout/Sidebar)
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    // Authenticated Dashboard Layout
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'dashboard/organizations',
                loadComponent: () => import('./features/dashboard/organization-list/organization-list.component').then(m => m.OrganizationListComponent)
            },
            {
                path: 'dashboard/organizations/:id',
                loadComponent: () => import('./features/dashboard/organization-detail/organization-detail.component').then(m => m.OrganizationDetailComponent)
            },
            {
                path: 'admin/audit',
                loadComponent: () => import('./features/admin/audit-log/audit-log.component').then(m => m.AuditLogComponent)
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
            }
        ]
    },
    {
        path: 'auth/login',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'auth/register',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
    },
    { path: '**', redirectTo: '' }
];
