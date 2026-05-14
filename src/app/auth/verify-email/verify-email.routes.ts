import { Routes } from "@angular/router";
import { verifyEmailRegisterGuard } from "./register.guard";

export const VERIFY_EMAIL_ROUTES: Routes = [
    {
        path: 'register',
        canMatch: [verifyEmailRegisterGuard],
    },
    {
        path: 'password-reset',
        loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPassword),  
    },
    {
        path: '**',
        redirectTo: '/not-found',
    }
];
