import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { UserService } from "../shared/services/user";
import { ToastService } from "../shared/services/toast";
import { HttpClient } from "@angular/common/http";
import { TokenVerification } from "../shared/models/user";

export const verifyEmailRegisterGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
    const userService = inject(UserService);
    const toastService = inject(ToastService);
    const router = inject(Router);
    const http = inject(HttpClient);

    let queryParams = route.queryParams;
    let tokenVerification: TokenVerification = {
        token: queryParams['token'] ?? '',
        id: parseInt(queryParams['id'] ?? -1),
    }

    http.post('/api/auth/register/verify-email', tokenVerification)
        .subscribe({
            next: () => toastService.addToast('User is now active', 'success'),
            error: () => toastService.addToast('There has been an error with activating the user, please try again', 'error'),
        })
    ;

    userService.logout();    
    return router.parseUrl('/auth/sign-in');
}