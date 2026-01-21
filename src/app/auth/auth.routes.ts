import { Routes } from "@angular/router";
import { unsignedGuard } from "../shared/guards/user-state.guard";

export const AUTH_ROUTES: Routes = [
    {
        path: 'sign-in',
        canMatch: [unsignedGuard],
        title: 'Sign In',
        loadComponent: () => import('./sign-in/sign-in').then(m => m.SignIn),
    },
    {
        path: 'register',
        canMatch: [unsignedGuard],
        title: 'Register',
        loadComponent: () => import('./register/register').then(m => m.Register),
    },
    {
        path: 'forgot-password',
        canMatch: [unsignedGuard],
        title: 'Register',
        loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword),
    },
    {
        path: 'verify-email',
        title: 'Email Verification',
        loadChildren: () => import('./verify-email/verify-email.routes').then(m => m.VERIFY_EMAIL_ROUTES),
    },
    {
        path: '**',
        redirectTo: '/not-found',
    }
];
