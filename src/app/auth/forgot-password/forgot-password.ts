import { Component, inject } from "@angular/core";
import { ToastService } from "../../shared/utils/toast.service";
import { LastRouteService } from "../../shared/utils/last-route.service";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { catchError, finalize, of, take } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { FormButton } from "../../shared/components/form/form-button/form-button";
import { FormInput } from "../../shared/components/form/form-input/form-input";

@Component({
    templateUrl: 'forgot-password.html',
    styleUrls: ['forgot-password.scss'],
    imports: [ReactiveFormsModule, FormButton, FormInput]
})
export class ForgotPassword {
    private readonly toastService = inject(ToastService);
    private readonly lastRouteService = inject(LastRouteService);
    private readonly authService = inject(AuthService);

    public readonly forgotPasswordForm = new FormGroup({
        username: new FormControl('', Validators.required),
    })
    public isWaiting = false;

    onSubmit() {
        this.isWaiting = true;
        this.authService
            .resetPassword(this.forgotPasswordForm.value.username!)
            .pipe(
                take(1),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 429) {
                        this.toastService.addToast("Too many attempts, please wait", "error");
                    } else {
                        this.toastService.addToast("If the username exist, check your inbox!", "success", 10);
                    }

                    return of(null);
                }),
                finalize(() => this.isWaiting = false),
            )
            .subscribe(() => {
                this.toastService.addToast("If the username exist, check your inbox!", "success", 10);
            })
        ;
    }

    async onBack() {
        await this.lastRouteService.redirectToLastRoute();
    }
}
