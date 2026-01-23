import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { ToastService } from "../../shared/utils/toast.service";
import { HttpClient } from "@angular/common/http";
import { AuthService, TokenVerification } from "../auth.service";

export const verifyEmailRegisterGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
    const authService = inject(AuthService);
    const toastService = inject(ToastService);
    const router = inject(Router);
    const http = inject(HttpClient);

    let queryParams = route.queryParams;
    let tokenVerification: TokenVerification = {
        token: queryParams['token'] ?? '',
        id: parseInt(queryParams['id'] ?? -1),
    }

    authService.logout()
        .subscribe(
            () => http.post('/api/auth/register/verify-email', tokenVerification)
                    .subscribe({
                        next: () => toastService.addToast('User is now active', 'success'),
                        error: () => toastService.addToast('There has been an error with activating the user, please try again', 'error', 10),
                    })
        )      
 
    return router.parseUrl('/auth/sign-in');
}