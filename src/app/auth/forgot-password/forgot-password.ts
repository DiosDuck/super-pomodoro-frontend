import { Component, inject } from "@angular/core";
import { ToastService } from "../../shared/services/toast";
import { LastRouteService } from "../../shared/services/last-route";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { catchError, finalize, take, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    templateUrl: 'forgot-password.html',
    styleUrls: ['../../shared/styles/form-page.scss', 'forgot-password.scss'],
    imports: [ReactiveFormsModule]
})
export class ForgotPassword {
    toastService = inject(ToastService);
    lastRouteService = inject(LastRouteService);
    authService = inject(AuthService);

    forgotPasswordForm = new FormGroup({
        username: new FormControl('', Validators.required),
    })
    isWaiting = false;

    onSubmit() {
        this.isWaiting = true;
        this.authService
            .resetPassword(this.forgotPasswordForm.value.username ?? '')
            .pipe(
                take(1),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 429) {
                        this.toastService.addToast("Too many attempts, please wait", "error");
                    } else {
                        this.toastService.addToast("If the username exist, check your inbox!", "success");
                    }

                    return throwError(() => error);
                }),
                finalize(() => this.isWaiting = false),
            )
            .subscribe(() => {
                this.toastService.addToast("If the username exist, check your inbox!", "success");
            })
        ;
    }

    async onBack() {
        await this.lastRouteService.redirectToLastRoute();
    }
}
