import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordMatchValidator } from '../../shared/validator/password-match';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/services/toast';
import { LastRouteService } from '../../shared/services/last-route';
import { catchError, take, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['../../shared/styles/form-page.scss', './register.scss'],
  imports: [ReactiveFormsModule],
})
export class Register {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  lastRouteService = inject(LastRouteService);
  router = inject(Router);

  registerForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      confirmPassword: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', Validators.required),
    },
    {validators: [passwordMatchValidator]}
  );

  errorRegister = false;
  isWaiting = false;

  async onSubmit() {
    this.isWaiting = true;
    this.errorRegister = false;

    this.authService.register(
      {
        username: this.registerForm.value.username!,
        password: this.registerForm.value.password!,
        displayName: this.registerForm.value.name!,
        email: this.registerForm.value.email!,
      })
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 429) {
            this.toastService.addToast("Too many register attempts in short time, please wait", "error");
          } else {
            this.errorRegister = true;
            this.registerForm.markAllAsTouched();
            this.toastService.addToast("Username is already taken", "error");
          }

          return throwError(() => error);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.addToast("Check the inbox to activate the account", "note");
          this.router.navigateByUrl('/auth/sign-in');
        },
        error: (err) => this.isWaiting = false,
      });
  }

  async onBack() {
    await this.lastRouteService.redirectToLastRoute();
  }

  isInvalid(key: string): boolean 
  {
    switch (key) {
      case 'username':
        return this.isUsernameInvalid();
      case 'confirmPassword': 
        return this.isConfirmPasswordInvalid();
      default: 
        return this.isSimpleFieldInvalid(key);
    }
  }

  private isConfirmPasswordInvalid(): boolean
  {
    const controller = this.registerForm.get('confirmPassword');
    if (!controller) {
      return true;
    }

    return controller.touched && (controller.invalid || this.registerForm.hasError('passwordMatch'));
  }

  private isSimpleFieldInvalid(key: string): boolean
  {
    const controller = this.registerForm.get(key);
    if (!controller) {
      return true;
    }

    return controller.touched && controller.invalid;
  }

  private isUsernameInvalid(): boolean
  {
    const controller = this.registerForm.get('username');
    if (!controller) {
      return true;
    }

    return controller.touched && (controller.invalid || this.errorRegister);
  }
}
