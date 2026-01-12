import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../../shared/services/user";
import { UpdateUserService } from "../../profile.services";
import { LastRouteService } from "../../../shared/services/last-route";
import { ToastService } from "../../../shared/services/toast";
import { Router } from "@angular/router";
import { finalize, take } from "rxjs";

@Component({
    selector: 'app-profile-delete-account',
    templateUrl: 'delete-account.html',
    styleUrls: ['../../../shared/styles/form-page.scss', 'delete-account.scss'],
    imports: [ReactiveFormsModule],
})
export class DeleteAccount {
    userService = inject(UserService);
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
                    this.userService.logout();
                    this.router.navigateByUrl('/auth/sign-in');
                },
                error: () => {
                    this.toastService.addToast('Wrong password, please introduce it again.', 'error');
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