import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, catchError, finalize } from 'rxjs';

import { passwordMatchValidator } from '../../shared/utils/password-match.validator';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/utils/toast.service';
import { LastRouteService } from '../../shared/utils/last-route.service';
import { FormButton } from '../../shared/components/form/form-button/form-button';
import { FormInput } from '../../shared/components/form/form-input/form-input';
import { HTTP_TOO_MANY_REQUESTS } from '../../shared/constants/http-status';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../shared/constants/validation';
import { LONG_TOAST_DURATION } from '../../shared/constants/toast';

const USERNAME_MIN_LENGTH = 6;
const USERNAME_MAX_LENGTH = 20;

const TOAST_RATE_LIMITED = 'Too many register attempts in short time, please wait';
const TOAST_USERNAME_TAKEN = 'Username is already taken';
const TOAST_CHECK_INBOX = 'Check the inbox to activate the account';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [ReactiveFormsModule, FormButton, FormInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly lastRouteService = inject(LastRouteService);
  private readonly router = inject(Router);

  private readonly errorRegister = signal(false);
  public readonly isWaiting = signal(false);

  public readonly registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(USERNAME_MIN_LENGTH), Validators.maxLength(USERNAME_MAX_LENGTH)]],
      password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
    },
    { validators: [passwordMatchValidator('password', 'confirmPassword')] },
  );

  private readonly formEvents = toSignal(this.registerForm.events, { initialValue: null });

  public readonly invalid = {
    username: computed(() => {
      this.formEvents();
      return this.usernameInvalid();
    }),
    password: computed(() => {
      this.formEvents();
      return this.simpleInvalid('password');
    }),
    confirmPassword: computed(() => {
      this.formEvents();
      return this.confirmPasswordInvalid();
    }),
    email: computed(() => {
      this.formEvents();
      return this.simpleInvalid('email');
    }),
    name: computed(() => {
      this.formEvents();
      return this.simpleInvalid('name');
    }),
  };

  public readonly canSubmit = computed(() => {
    this.formEvents();
    return this.registerForm.valid && !this.isWaiting();
  });

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.isWaiting.set(true);
    this.errorRegister.set(false);

    const { username, password, name, email } = this.registerForm.getRawValue();

    this.authService.register({ username, password, displayName: name, email })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === HTTP_TOO_MANY_REQUESTS) {
            this.toastService.addToast(TOAST_RATE_LIMITED, 'error', LONG_TOAST_DURATION);
          } else {
            this.errorRegister.set(true);
            this.registerForm.markAllAsTouched();
            this.toastService.addToast(TOAST_USERNAME_TAKEN, 'error');
          }
          return EMPTY;
        }),
        finalize(() => this.isWaiting.set(false)),
      )
      .subscribe(() => {
        this.toastService.addToast(TOAST_CHECK_INBOX, 'note', LONG_TOAST_DURATION);
        this.router.navigateByUrl('/auth/sign-in');
      });
  }

  onBack(): void {
    this.lastRouteService.redirectToLastRoute();
  }

  private usernameInvalid(): boolean {
    const control = this.registerForm.controls.username;
    return control.touched && (control.invalid || this.errorRegister());
  }

  private confirmPasswordInvalid(): boolean {
    const control = this.registerForm.controls.confirmPassword;
    return control.touched && (control.invalid || this.registerForm.hasError('passwordMatch'));
  }

  private simpleInvalid(key: 'password' | 'email' | 'name'): boolean {
    const control = this.registerForm.controls[key];
    return control.touched && control.invalid;
  }
}
