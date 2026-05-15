import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { ResetPassword } from "./reset-password";
import { ResetPasswordService } from "../reset-password.service";
import { ToastService } from "../../../shared/utils/toast.service";
import { LastRouteService } from "../../../shared/utils/last-route.service";
import { AuthService } from "../../auth.service";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

describe('Reset Password Component', () => {
    let toastService: { addToast: Mock };
    let lastRouteService: { redirectToLastRoute: Mock };
    let authService: { logout: Mock };
    let resetPasswordService: { setParameters: Mock; updatePassword: Mock };
    let activatedRoute: { queryParams: Observable<{ token: string; id: string }> };
    let fixture: ComponentFixture<ResetPassword>;
    let component: ResetPassword;
    let nativeElement: HTMLElement;

    const validValues = {
        password: 'password',
        confirmPassword: 'password',
    };

    beforeEach(() => {
        toastService = { addToast: vi.fn() };
        lastRouteService = { redirectToLastRoute: vi.fn() };
        authService = { logout: vi.fn().mockReturnValue(of(null)) };
        resetPasswordService = { setParameters: vi.fn(), updatePassword: vi.fn() };
        activatedRoute = { queryParams: of({ token: 'tok', id: '1' }) };

        TestBed.configureTestingModule({
            imports: [ResetPassword],
            providers: [
                { provide: ToastService, useValue: toastService },
                { provide: LastRouteService, useValue: lastRouteService },
                { provide: AuthService, useValue: authService },
                { provide: ResetPasswordService, useValue: resetPasswordService },
                { provide: ActivatedRoute, useValue: activatedRoute },
            ],
        });

        fixture = TestBed.createComponent(ResetPassword);
        component = fixture.componentInstance;
        nativeElement = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('sets reset parameters on init', () => {
        expect(authService.logout).toHaveBeenCalledOnce();
        expect(resetPasswordService.setParameters).toHaveBeenCalledOnce();
        expect(resetPasswordService.setParameters).toHaveBeenCalledWith('tok', 1);
    });

    it('does not submit when form is invalid', () => {
        component.onSubmit();

        expect(resetPasswordService.updatePassword).not.toHaveBeenCalled();
        expect(toastService.addToast).not.toHaveBeenCalled();
        expect(lastRouteService.redirectToLastRoute).not.toHaveBeenCalled();
    });

    it('Validator testing', () => {
        component.resetPasswordForm.setValue({
            password: '',
            confirmPassword: '',
        });
        component.resetPasswordForm.markAllAsTouched();
        component.resetPasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(true);

        component.resetPasswordForm.setValue({
            password: 'password',
            confirmPassword: 'different',
        });
        component.resetPasswordForm.markAllAsTouched();
        component.resetPasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(true);

        component.resetPasswordForm.setValue(validValues);
        component.resetPasswordForm.markAllAsTouched();
        component.resetPasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(false);
    });

    it('disables submit while waiting', () => {
        const pending = new Subject<unknown>();
        resetPasswordService.updatePassword.mockReturnValue(pending.asObservable());

        component.resetPasswordForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        expect(submit.disabled).toBe(false);

        submit.click();
        fixture.detectChanges();

        expect(submit.disabled).toBe(true);

        pending.complete();
    });

    it('successful reset', () => {
        resetPasswordService.updatePassword.mockReturnValue(of(null));

        component.resetPasswordForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(resetPasswordService.updatePassword).toHaveBeenCalledOnce();
        expect(resetPasswordService.updatePassword).toHaveBeenCalledWith('password');
        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('Successfully reseted the password!', 'success');
        expect(lastRouteService.redirectToLastRoute).toHaveBeenCalledOnce();
    });

    it('error on reset', () => {
        resetPasswordService.updatePassword.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, statusText: 'Bad Request' })));

        component.resetPasswordForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('There has been an error!', 'error');
        expect(lastRouteService.redirectToLastRoute).not.toHaveBeenCalled();
    });
});
