import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UpdateUserService } from "../../profile.services";
import { LastRouteService } from "../../../shared/utils/last-route.service";
import { ToastService } from "../../../shared/utils/toast.service";
import { Router } from "@angular/router";
import { finalize, take } from "rxjs";
import { AuthService } from "../../../auth/auth.service";

@Component({
    selector: 'app-profile-delete-account',
    templateUrl: 'delete-account.html',
    styleUrls: ['delete-account.scss'],
    imports: [ReactiveFormsModule],
})
export class DeleteAccount {
    authService = inject(AuthService);
    updateUserService = inject(UpdateUserService);
    lastRouterService = inject(LastRouteService);
    toastService = inject(ToastService);
    router = inject(Router);

    deleteAccountForm = new FormGroup({
        password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    });

    isWaiting = false;

    onSubmit() {
        this.isWaiting = true;
        this.updateUserService.deleteAccount(
                this.deleteAccountForm.value.password!
            )
            .pipe(
                take(1),
                finalize(
                    () => this.isWaiting = false
                )
            )
            .subscribe({
                next: () => {
                    this.toastService.addToast('User has been deleted.', 'note');
                    this.lastRouterService.updateLastRoute('/');
                    this.authService.logout()
                        .subscribe(() => this.router.navigateByUrl('/auth/sign-in'));
                },
                error: () => {
                    this.toastService.addToast('Wrong password, please introduce it again.', 'error', 10);
                }
            })
        ;
    }

    isInvalid(key: string): boolean
    {
        const controller = this.deleteAccountForm.get(key);
        if (!controller) {
        return true;
        }

        return controller.touched && controller.invalid;
    }
}