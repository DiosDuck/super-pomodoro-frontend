import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';

import { passwordMatchValidator } from '../../../shared/utils/password-match.validator';
import { ToastService } from '../../../shared/utils/toast.service';
import { UpdateUserService } from '../../profile.service';
import { LastRouteService } from '../../../shared/utils/last-route.service';
import { AuthService } from '../../../auth/auth.service';
import { FormButton } from '../../../shared/components/form/form-button/form-button';
import { FormInput } from '../../../shared/components/form/form-input/form-input';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../../shared/constants/validation';
import { LONG_TOAST_DURATION } from '../../../shared/utils/toast.service';

const TOAST_PASSWORD_CHANGED = 'Password has been changed, please log in.';
const TOAST_WRONG_PASSWORD = 'Wrong password, please introduce it again.';

@Component({
    selector: 'app-profile-change-password',
    templateUrl: 'change-password.html',
    styleUrls: ['change-password.scss'],
    imports: [ReactiveFormsModule, FormButton, FormInput],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly updateUserService = inject(UpdateUserService);
  private readonly lastRouteService = inject(LastRouteService);
  private readonly router = inject(Router);

  public readonly isWaiting = signal(false);

  public readonly changePasswordForm = this.fb.nonNullable.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
    },
    { validators: [passwordMatchValidator('newPassword', 'confirmPassword')] },
  );

  private readonly formEvents = toSignal(this.changePasswordForm.events, { initialValue: null });

  public readonly invalid = {
    oldPassword: computed(() => {
      this.formEvents();
      return this.simpleInvalid('oldPassword');
    }),
    newPassword: computed(() => {
      this.formEvents();
      return this.simpleInvalid('newPassword');
    }),
    confirmPassword: computed(() => {
      this.formEvents();
      return this.confirmPasswordInvalid();
    }),
  };

  public readonly canSubmit = computed(() => {
    this.formEvents();
    return this.changePasswordForm.valid && !this.isWaiting();
  });

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.isWaiting.set(true);

    const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();

    this.updateUserService.updatePassword(oldPassword, newPassword)
      .pipe(
        tap(() => {
          this.toastService.addToast(TOAST_PASSWORD_CHANGED, 'note', LONG_TOAST_DURATION);
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

  private simpleInvalid(key: 'oldPassword' | 'newPassword'): boolean {
    const control = this.changePasswordForm.controls[key];
    return control.touched && control.invalid;
  }

  private confirmPasswordInvalid(): boolean {
    const control = this.changePasswordForm.controls.confirmPassword;
    return control.touched && (control.invalid || this.changePasswordForm.hasError('passwordMatch'));
  }
}
