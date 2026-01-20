import { Routes } from "@angular/router";

export const POMODORO_ROUTES : Routes = [
    {
        path: '',
        loadComponent: () => import('./index/index').then(m => m.Index),

    },
    {
        path: 'settings',
        title: 'Pomodoro Settings',
        loadComponent: () => import('./settings/settings').then(m => m.Settings),
    },
    {
        path: '**',
        redirectTo: '/not-found',
    }
];