import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';

import { UpdateUserService } from '../../profile.service';
import { LastRouteService } from '../../../shared/utils/last-route.service';
import { ToastService } from '../../../shared/utils/toast.service';
import { AuthService } from '../../../auth/auth.service';
import { FormButton } from '../../../shared/components/form/form-button/form-button';
import { FormInput } from '../../../shared/components/form/form-input/form-input';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../../shared/constants/validation';
import { LONG_TOAST_DURATION } from '../../../shared/constants/toast';

const TOAST_USER_DELETED = 'User has been deleted.';
const TOAST_WRONG_PASSWORD = 'Wrong password, please introduce it again.';

@Component({
    selector: 'app-profile-delete-account',
    templateUrl: 'delete-account.html',
    styleUrls: ['delete-account.scss'],
    imports: [ReactiveFormsModule, FormButton, FormInput],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccount {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly updateUserService = inject(UpdateUserService);
    private readonly lastRouteService = inject(LastRouteService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);

    public readonly isWaiting = signal(false);

    public readonly deleteAccountForm = this.fb.nonNullable.group({
        password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
    });

    private readonly formEvents = toSignal(this.deleteAccountForm.events, { initialValue: null });

    public readonly invalid = {
        password: computed(() => {
            this.formEvents();
            const control = this.deleteAccountForm.controls.password;
            return control.touched && control.invalid;
        }),
    };

    public readonly canSubmit = computed(() => {
        this.formEvents();
        return this.deleteAccountForm.valid && !this.isWaiting();
    });

    onSubmit(): void {
        if (!this.canSubmit()) {
            return;
        }

        this.isWaiting.set(true);

        const { password } = this.deleteAccountForm.getRawValue();

        this.updateUserService.deleteAccount(password)
            .pipe(
                tap(() => {
                    this.toastService.addToast(TOAST_USER_DELETED, 'note');
                    this.lastRouteService.updateLastRoute('/');
                }),
                switchMap(() => this.authService.logout()),
                finalize(() => this.isWaiting.set(false)),
            )
            .subscribe({
                next: () => this.router.navigateByUrl('/auth/sign-in'),
                error: () => {
                    this.toastService.addToast(TOAST_WRONG_PASSWORD, 'error', LONG_TOAST_DURATION);
                },
            });
    }
}
