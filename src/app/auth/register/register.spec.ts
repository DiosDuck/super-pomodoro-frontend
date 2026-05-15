import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { Register } from "./register";
import { ToastService } from "../../shared/utils/toast.service";
import { LastRouteService } from "../../shared/utils/last-route.service";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { Subject, of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

describe('Register Component', () => {
    let toastService: { addToast: Mock };
    let lastRouteService: { redirectToLastRoute: Mock };
    let authService: { register: Mock };
    let router: { navigateByUrl: Mock };
    let fixture: ComponentFixture<Register>;
    let component: Register;
    let nativeElement: HTMLElement;

    const validValues = {
        username: 'username',
        password: 'password',
        confirmPassword: 'password',
        email: 'user@email.com',
        name: 'User Name',
    };

    beforeEach(() => {
        toastService = { addToast: vi.fn() };
        lastRouteService = { redirectToLastRoute: vi.fn() };
        authService = { register: vi.fn() };
        router = { navigateByUrl: vi.fn() };

        TestBed.configureTestingModule({
            imports: [Register],
            providers: [
                { provide: ToastService, useValue: toastService },
                { provide: LastRouteService, useValue: lastRouteService },
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router },
            ],
        });

        fixture = TestBed.createComponent(Register);
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

        expect(authService.register).not.toHaveBeenCalled();
        expect(toastService.addToast).not.toHaveBeenCalled();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('Validator testing', () => {
        component.registerForm.setValue({
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            name: '',
        });
        component.registerForm.markAllAsTouched();
        component.registerForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#username')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#email')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#name')?.classList.contains('invalid')).toBe(true);

        component.registerForm.setValue({
            username: 'usr',
            password: 'password',
            confirmPassword: 'password',
            email: 'not-an-email',
            name: 'User Name',
        });
        component.registerForm.markAllAsTouched();
        component.registerForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#username')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#email')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#name')?.classList.contains('invalid')).toBe(false);

        component.registerForm.setValue({
            username: 'username',
            password: 'password',
            confirmPassword: 'different',
            email: 'user@email.com',
            name: 'User Name',
        });
        component.registerForm.markAllAsTouched();
        component.registerForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#username')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#email')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#name')?.classList.contains('invalid')).toBe(false);

        component.registerForm.setValue(validValues);
        component.registerForm.markAllAsTouched();
        component.registerForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#username')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#password')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#email')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#name')?.classList.contains('invalid')).toBe(false);
    });

    it('disables submit while waiting', () => {
        const pending = new Subject<unknown>();
        authService.register.mockReturnValue(pending.asObservable());

        component.registerForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        expect(submit.disabled).toBe(false);

        submit.click();
        fixture.detectChanges();

        expect(submit.disabled).toBe(true);

        pending.complete();
    });

    it('successful registration', () => {
        authService.register.mockReturnValue(of(null));

        component.registerForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(authService.register).toHaveBeenCalledOnce();
        expect(authService.register).toHaveBeenCalledWith({
            username: 'username',
            password: 'password',
            displayName: 'User Name',
            email: 'user@email.com',
        });
        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('Check the inbox to activate the account', 'note', 10);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in');
    });

    it('rate limit error', () => {
        authService.register.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' })));

        component.registerForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('Too many register attempts in short time, please wait', 'error', 10);
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('username already taken', () => {
        authService.register.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' })));

        component.registerForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('Username is already taken', 'error');
        expect(nativeElement.querySelector('#username')?.classList.contains('invalid')).toBe(true);
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
});
