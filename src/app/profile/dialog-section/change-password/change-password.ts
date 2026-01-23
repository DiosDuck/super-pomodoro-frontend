import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../../shared/utils/password-match.validator";
import { ToastService } from "../../../shared/utils/toast.service";
import { UpdateUserService } from "../../profile.services";
import { finalize, take } from "rxjs";
import { LastRouteService } from "../../../shared/utils/last-route.service";
import { Router } from "@angular/router";
import { AuthService } from "../../../auth/auth.service";

@Component({
    selector: 'app-profile-change-password',
    templateUrl: 'change-password.html',
    styleUrls: ['change-password.scss'],
    imports: [ReactiveFormsModule],
})
export class ChangePassword {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  updateUserService = inject(UpdateUserService);
  lastRouteService = inject(LastRouteService);
  router = inject(Router);

  changePasswordForm = new FormGroup(
    {
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    },
    {validators: [passwordMatchValidator('newPassword', 'confirmPassword')]}
  );

  isWaiting = false;

  onSubmit() {
    this.isWaiting = true;
    this.updateUserService.updatePassword(
        this.changePasswordForm.value.oldPassword!,
        this.changePasswordForm.value.newPassword!,
      )
      .pipe(
        take(1),
        finalize(() => this.isWaiting = false)
      )
      .subscribe(
        {
          next: () => {
            this.toastService.addToast('Password has been changed, please log in.', 'note', 10);
            this.authService.logout()
              .subscribe(() => {
                this.lastRouteService.updateLastRoute('/');
                this.router.navigateByUrl('/auth/sign-in');
              });
          },
          error: () => {
            this.toastService.addToast('Wrong password, please introduce it again.', 'error', 10);
          }
        }
      )
  }

  isInvalid(key: string): boolean 
  {
    switch (key) {
      case 'confirmPassword': 
        return this.isConfirmPasswordInvalid();
      default: 
        return this.isSimpleFieldInvalid(key);
    }
  }

  private isConfirmPasswordInvalid(): boolean
  {
    const controller = this.changePasswordForm.get('confirmPassword');
    if (!controller) {
      return true;
    }

    return controller.touched && (controller.invalid || this.changePasswordForm.hasError('passwordMatch'));
  }

  private isSimpleFieldInvalid(key: string): boolean
  {
    const controller = this.changePasswordForm.get(key);
    if (!controller) {
      return true;
    }

    return controller.touched && controller.invalid;
  }
}