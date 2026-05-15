import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap, take } from 'rxjs';

import { ResetPasswordService } from '../reset-password.service';
import { passwordMatchValidator } from '../../../shared/utils/password-match.validator';
import { ToastService } from '../../../shared/utils/toast.service';
import { LastRouteService } from '../../../shared/utils/last-route.service';
import { AuthService } from '../../auth.service';
import { FormInput } from '../../../shared/components/form/form-input/form-input';
import { FormButton } from '../../../shared/components/form/form-button/form-button';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../../shared/constants/validation';

const TOAST_RESET_OK = 'Successfully reseted the password!';
const TOAST_RESET_FAIL = 'There has been an error!';

@Component({
    templateUrl: 'reset-password.html',
    styleUrls: ['reset-password.scss'],
    imports: [ReactiveFormsModule, FormInput, FormButton],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly resetPasswordService = inject(ResetPasswordService);
    private readonly route = inject(ActivatedRoute);
    private readonly toastService = inject(ToastService);
    private readonly lastRouteService = inject(LastRouteService);

    public readonly isWaiting = signal(false);

    public readonly resetPasswordForm = this.fb.nonNullable.group(
        {
            password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
        },
        { validators: [passwordMatchValidator('password', 'confirmPassword')] },
    );

    private readonly formEvents = toSignal(this.resetPasswordForm.events, { initialValue: null });

    public readonly invalid = {
        password: computed(() => {
            this.formEvents();
            return this.simpleInvalid('password');
        }),
        confirmPassword: computed(() => {
            this.formEvents();
            return this.confirmPasswordInvalid();
        }),
    };

    public readonly canSubmit = computed(() => {
        this.formEvents();
        return this.resetPasswordForm.valid && !this.isWaiting();
    });

    ngOnInit(): void {
        this.authService.logout()
            .pipe(switchMap(() => this.route.queryParams.pipe(take(1))))
            .subscribe((params) => {
                this.resetPasswordService.setParameters(
                    params['token'],
                    parseInt(params['id']),
                );
            });
    }

    onSubmit(): void {
        if (!this.canSubmit()) {
            return;
        }

        this.isWaiting.set(true);

        const { password } = this.resetPasswordForm.getRawValue();

        this.resetPasswordService.updatePassword(password)
            .pipe(finalize(() => this.isWaiting.set(false)))
            .subscribe({
                next: () => {
                    this.toastService.addToast(TOAST_RESET_OK, 'success');
                    this.lastRouteService.redirectToLastRoute();
                },
                error: () => {
                    this.toastService.addToast(TOAST_RESET_FAIL, 'error');
                },
            });
    }

    private simpleInvalid(key: 'password'): boolean {
        const control = this.resetPasswordForm.controls[key];
        return control.touched && control.invalid;
    }

    private confirmPasswordInvalid(): boolean {
        const control = this.resetPasswordForm.controls.confirmPassword;
        return control.touched && (control.invalid || this.resetPasswordForm.hasError('passwordMatch'));
    }
}
