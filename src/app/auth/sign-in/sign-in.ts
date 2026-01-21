import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/utils/toast.service';
import { LastRouteService } from '../../shared/utils/last-route.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
  imports: [ReactiveFormsModule, RouterLink],
})
export class SignIn {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  lastRouteService = inject(LastRouteService);

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  })
  isWaiting = false;

  async onSubmit() {
    this.isWaiting = true;
    try {
      const loginData = {
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!,
      }
      await this.authService.login(loginData);
      this.toastService.addToast("Successful sign in!", "success");
      await this.lastRouteService.redirectToLastRoute();
    } catch (err) {
      this.toastService.addToast("Username or password invalid!", "error");
      this.isWaiting = false;
    }
  }

  async onBack() {
    await this.lastRouteService.redirectToLastRoute();
  }
}
