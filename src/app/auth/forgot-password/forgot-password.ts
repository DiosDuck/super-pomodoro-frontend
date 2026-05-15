import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, catchError, finalize, of } from 'rxjs';

import { ToastService } from '../../shared/utils/toast.service';
import { LastRouteService } from '../../shared/utils/last-route.service';
import { AuthService } from '../auth.service';
import { FormButton } from '../../shared/components/form/form-button/form-button';
import { FormInput } from '../../shared/components/form/form-input/form-input';
import { HTTP_TOO_MANY_REQUESTS } from '../../shared/constants/http-status';
import { LONG_TOAST_DURATION } from '../../shared/utils/toast.service';

const TOAST_RATE_LIMITED = 'Too many attempts, please wait';
const TOAST_CHECK_INBOX = 'If the username exists, check your inbox!';

@Component({
    templateUrl: 'forgot-password.html',
    styleUrls: ['forgot-password.scss'],
    imports: [ReactiveFormsModule, FormButton, FormInput],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
    private readonly fb = inject(FormBuilder);
    private readonly toastService = inject(ToastService);
    private readonly lastRouteService = inject(LastRouteService);
    private readonly authService = inject(AuthService);

    public readonly isWaiting = signal(false);

    public readonly forgotPasswordForm = this.fb.nonNullable.group({
        username: ['', Validators.required],
    });

    private readonly formEvents = toSignal(this.forgotPasswordForm.events, { initialValue: null });

    public readonly canSubmit = computed(() => {
        this.formEvents();
        return this.forgotPasswordForm.valid && !this.isWaiting();
    });

    onSubmit(): void {
        if (!this.canSubmit()) {
            return;
        }

        this.isWaiting.set(true);

        const { username } = this.forgotPasswordForm.getRawValue();

        this.authService
            .resetPassword(username)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === HTTP_TOO_MANY_REQUESTS) {
                        this.toastService.addToast(TOAST_RATE_LIMITED, 'error');
                        return EMPTY;
                    }
                    return of(null);
                }),
                finalize(() => this.isWaiting.set(false)),
            )
            .subscribe(() => {
                this.toastService.addToast(TOAST_CHECK_INBOX, 'success', LONG_TOAST_DURATION);
            });
    }

    onBack(): void {
        this.lastRouteService.redirectToLastRoute();
    }
}
