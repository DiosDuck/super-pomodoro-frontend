import { Routes } from '@angular/router';
import { adminGuard, signedGuard } from './shared/guards/user-state';

export const routes: Routes = [
    {
        path: 'status',
        canActivate: [adminGuard],
        title: 'Status page',
        loadComponent: () => import('./status/index/index').then(m => m.Index),
    },
    {
        path: '',
        pathMatch: 'full',
        title: 'Home',
        loadComponent: () => import('./home/home').then(m => m.Home),
    },
    {
        path: 'pomodoro',
        loadChildren: () => import('./pomodoro/pomodoro.routes').then(m => m.POMODORO_ROUTES),
    },
    {
        path: 'verify-email',
        title: 'Email Verification',
        loadChildren: () => import('./verify-email/verify-email.routes').then(m => m.VERIFY_EMAIL_ROUTES),
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
    },
    {
        path: 'profile',
        canMatch: [signedGuard],
        loadChildren: () => import('./profile/profile.routes').then(m => m.PROFILE_ROUTES),
    },
    {
        path: 'not-found',
        title: 'Womp Womp',
        loadComponent: () => import('./not-found/not-found').then(m => m.NotFound),
    },
    {
        path: '**',
        redirectTo: '/not-found'
    }
];
