import { Routes } from "@angular/router";
import { verifyEmailRegisterGuard } from "./verify-email.guards";

export const VERIFY_EMAIL_ROUTES: Routes = [
    {
        path: 'register',
        canActivate: [verifyEmailRegisterGuard],    
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
