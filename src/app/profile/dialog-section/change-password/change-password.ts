import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../../shared/validator/password-match";
import { UserService } from "../../../shared/services/user";
import { ToastService } from "../../../shared/services/toast";
import { UpdateUserService } from "../../profile.services";
import { finalize, take } from "rxjs";
import { LastRouteService } from "../../../shared/services/last-route";
import { Router } from "@angular/router";

@Component({
    selector: 'app-profile-change-password',
    templateUrl: 'change-password.html',
    styleUrls: ['../../../shared/styles/form-page.scss', 'change-password.scss'],
    imports: [ReactiveFormsModule],
})
export class ChangePassword {
  userService = inject(UserService);
  toastService = inject(ToastService);
  updateUserService = inject(UpdateUserService);
  lastRouteService = inject(LastRouteService);
  router = inject(Router);

  changePasswordForm = new FormGroup(
    {
      oldPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    },
    {validators: [passwordMatchValidator]}
  );

  isWaiting = false;

  onSubmit() {
    this.isWaiting = true;
    this.updateUserService.updatePassword(
        this.changePasswordForm.value.oldPassword!,
        this.changePasswordForm.value.password!,
      )
      .pipe(
        take(1),
        finalize(() => this.isWaiting = false)
      )
      .subscribe(
        {
          next: () => {
            this.toastService.addToast('Password has been changed, please log in.', 'note');
            this.userService.logout();
            this.lastRouteService.updateLastRoute('/');
            this.router.navigateByUrl('/auth/sign-in');
          },
          error: () => {
            this.toastService.addToast('Wrong password, please introduce it again.', 'error');
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