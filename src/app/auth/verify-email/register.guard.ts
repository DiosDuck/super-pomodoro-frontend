import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { ToastService } from "../../shared/utils/toast.service";
import { HttpClient } from "@angular/common/http";
import { AuthService, TokenVerification } from "../auth.service";
import { switchMap, map, catchError, of } from "rxjs";

export const verifyEmailRegisterGuard: CanMatchFn = () => {
    const authService = inject(AuthService);
    const toastService = inject(ToastService);
    const router = inject(Router);
    const http = inject(HttpClient);

    const queryParams = router.currentNavigation()?.extractedUrl.queryParams ?? {};
    const tokenVerification: TokenVerification = {
        token: queryParams['token'] ?? '',
        id: parseInt(queryParams['id'] ?? -1),
    }

    return authService.logout().pipe(
        switchMap(() => http.post('/api/auth/register/verify-email', tokenVerification)),
        map(() => {
            toastService.addToast('User is now active', 'success');
            return router.parseUrl('/auth/sign-in');
        }),
        catchError(() => {
            toastService.addToast('There has been an error with activating the user, please try again', 'error', 10);
            return of(router.parseUrl('/'));
        }),
    );
}
