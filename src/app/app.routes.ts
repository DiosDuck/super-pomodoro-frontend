import { Routes } from '@angular/router';
import { adminGuard, signedGuard } from './shared/guards/user-state.guard';

export const routes: Routes = [
    {
        path: 'status',
        canActivate: [adminGuard],
        runGuardsAndResolvers: 'always',
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
        path: 'auth',
        runGuardsAndResolvers: 'always',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
    },
    {
        path: 'profile',
        canActivate: [signedGuard],
        runGuardsAndResolvers: 'always',
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
