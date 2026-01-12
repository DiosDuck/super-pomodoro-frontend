import { Routes } from "@angular/router";

export const PROFILE_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        title: 'Profile',
        loadComponent: () => import('./index/index').then(m => m.Index),
    },
    {
        path: '**',
        redirectTo: '/not-found'
    }
];
