import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/utils/toast.service';
import { LastRouteService } from '../../shared/utils/last-route.service';
import { FormInput } from '../../shared/components/form/form-input/form-input';
import { FormButton } from '../../shared/components/form/form-button/form-button';

const TOAST_SIGN_IN_OK = 'Successful sign in!';
const TOAST_SIGN_IN_FAIL = 'Username or password invalid!';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
  imports: [ReactiveFormsModule, RouterLink, FormInput, FormButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignIn {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly lastRouteService = inject(LastRouteService);

  public readonly isWaiting = signal(false);

  public readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private readonly formEvents = toSignal(this.loginForm.events, { initialValue: null });

  public readonly canSubmit = computed(() => {
    this.formEvents();
    return this.loginForm.valid && !this.isWaiting();
  });

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.isWaiting.set(true);

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login({ username, password })
      .pipe(finalize(() => this.isWaiting.set(false)))
      .subscribe({
        next: () => {
          this.toastService.addToast(TOAST_SIGN_IN_OK, 'success');
          this.lastRouteService.redirectToLastRoute();
        },
        error: () => {
          this.toastService.addToast(TOAST_SIGN_IN_FAIL, 'error');
        },
      });
  }

  onBack(): void {
    this.lastRouteService.redirectToLastRoute();
  }
}
