import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { ForgotPassword } from "./forgot-password";
import { ToastService } from "../../shared/utils/toast.service";
import { LastRouteService } from "../../shared/utils/last-route.service";
import { AuthService } from "../auth.service";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

describe('Authentication Forgot Password', () => {
    let toastService: { addToast: Mock };
    let lastRouteService: { redirectToLastRoute: Mock };
    let fixture: ComponentFixture<ForgotPassword>;
    let component: ForgotPassword;
    let nativeElement: HTMLElement;
    let authService: { resetPassword: Mock };

    beforeEach(() => {
        toastService = { addToast: vi.fn() };
        lastRouteService = { redirectToLastRoute: vi.fn() };
        authService = { resetPassword: vi.fn() };

        TestBed.configureTestingModule({
            imports: [ForgotPassword],
            providers: [
                { provide: ToastService, useValue: toastService },
                { provide: LastRouteService, useValue: lastRouteService },
                { provide: AuthService, useValue: authService }
            ]
        });

        fixture = TestBed.createComponent(ForgotPassword);
        component = fixture.componentInstance;
        nativeElement = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('go back button', () => {
        let back = nativeElement.querySelector<HTMLButtonElement>('#form-button-back')!;
        back.click();

        expect(lastRouteService.redirectToLastRoute).toHaveBeenCalledOnce();
    });

    it('does not submit when form is invalid', () => {
        component.onSubmit();

        expect(authService.resetPassword).not.toHaveBeenCalled();
        expect(toastService.addToast).not.toHaveBeenCalled();
    });

    it('success sending email', () => {
        vi.spyOn(authService, 'resetPassword').mockReturnValue(of(null));

        let submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        component.forgotPasswordForm.setValue({ username: 'username' });
        component.forgotPasswordForm.markAllAsTouched();
        component.forgotPasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(false);

        submit.click();
        fixture.detectChanges();

        expect(authService.resetPassword).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith("If the username exists, check your inbox!", "success", 10);
    });

    it('hide user not found error', () => {
        vi.spyOn(authService, 'resetPassword').mockReturnValue(throwError(() => new HttpErrorResponse({status: 404, statusText: 'User not found'})));

        let submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        component.forgotPasswordForm.setValue({ username: 'username' });
        component.forgotPasswordForm.markAllAsTouched();
        component.forgotPasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(false);

        submit.click();
        fixture.detectChanges();

        expect(authService.resetPassword).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith("If the username exists, check your inbox!", "success", 10);
    });

    it('limit rate error', () => {
        vi.spyOn(authService, 'resetPassword').mockReturnValue(throwError(() => new HttpErrorResponse({status: 429, statusText: 'Too Many calls'})));

        let submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        component.forgotPasswordForm.setValue({ username: 'username' });
        component.forgotPasswordForm.markAllAsTouched();
        component.forgotPasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(false);

        submit.click();
        fixture.detectChanges();

        expect(authService.resetPassword).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith("Too many attempts, please wait", "error");
    });
});
