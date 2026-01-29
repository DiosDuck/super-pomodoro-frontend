import { inject } from "@angular/core";
import { CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";
import { ToastService } from "../utils/toast.service";
import { LastRouteService } from "../utils/last-route.service";
import { UserService } from "../../auth/auth.service";

export const unsignedGuard: CanActivateChildFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const toasterService = inject(ToastService);
    
    return userService.waitFirstUser()
        .pipe(map(user => {
                if (user === null) {
                    return true;
                }

                toasterService.addToast('You cannot enter the current url as signed user', 'note', 10);
                router.navigateByUrl('/');
                return false;
            }
        ))
    ;
}

export const signedGuard: CanActivateChildFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const toasterService = inject(ToastService);
    const lastRouteSession = inject(LastRouteService);

    return userService.waitFirstUser()
        .pipe(map(
            user => {
                if (user !== null) {
                    return true;
                }

                lastRouteSession.updateLastRoute(router.url);
                toasterService.addToast('You cannot enter the current url as unsigned user', 'note', 10);
                router.navigateByUrl('/auth/sign-in');
                return false;
            }
        ))
    ;
}

export const adminGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const toasterService = inject(ToastService);
    const lastRouteSession = inject(LastRouteService);

    return userService.waitFirstUser()
        .pipe(map(
            user => {
                if (user !== null && user.roles.includes("ROLE_ADMIN")) {
                    return true;
                }

                lastRouteSession.updateLastRoute(router.url);
                toasterService.addToast('You are not an admin!', 'error');
                router.navigateByUrl('/');
                return false;
            }
        ))
    ;
}
