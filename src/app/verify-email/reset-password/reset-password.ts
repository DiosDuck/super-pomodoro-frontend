import { Component, inject, OnInit } from "@angular/core";
import { UserService } from "../../shared/services/user";
import { ActivatedRoute } from "@angular/router";
import { ResetPasswordService } from "../verify-email.services";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../shared/validator/password-match";
import { ToastService } from "../../shared/services/toast";
import { finalize, take } from "rxjs";
import { LastRouteService } from "../../shared/services/last-route";

@Component({
    templateUrl: 'reset-password.html',
    styleUrls: ['../../shared/styles/form-page.scss', 'reset-password.scss'],
    imports: [ReactiveFormsModule],
})
export class ResetPassword implements OnInit{
    userService = inject(UserService);
    resetPasswordService = inject(ResetPasswordService);
    route = inject(ActivatedRoute);
    toastService = inject(ToastService);
    lastRouteService = inject(LastRouteService);
    resetPasswordForm = new FormGroup(
        {
            password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)])
        },
        {validators: [passwordMatchValidator]}
    );
    isWaiting = false;

    ngOnInit(): void {
        this.userService.logout();
        let queryParams = this.route.queryParams
            .pipe(
                take(1),
            )
            .subscribe((params) => {
                this.resetPasswordService.setParameters(
                    params['token'],
                    parseInt(params['id']),
                );
            });
    }

    onSubmit() {
        this.isWaiting = true;
        this.resetPasswordService.updatePassword(
                this.resetPasswordForm.value.password!
            )
            .pipe(
                take(1),
                finalize(() => this.isWaiting = false)
            )
            .subscribe({
                next: () => {
                    this.toastService.addToast('Successfully reseted the password!', 'success');
                    this.lastRouteService.redirectToLastRoute();
                },
                error: () => 
                    this.toastService.addToast('There has been an error!', 'error')
                
            })
    }

    isInvalid(key: string): boolean 
    {
        const controller = this.resetPasswordForm.get(key);
        if (!controller) {
            return true;
        }

        return controller.touched && (controller.invalid ||  this.resetPasswordForm.hasError('passwordMatch'));
    }
}
