import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { SignIn } from "./sign-in";
import { ToastService } from "../../shared/utils/toast.service";
import { LastRouteService } from "../../shared/utils/last-route.service";
import { AuthService } from "../auth.service";
import { provideRouter } from "@angular/router";
import { Subject, of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

describe('Sign In Component', () => {
    let toastService: { addToast: Mock };
    let lastRouteService: { redirectToLastRoute: Mock };
    let authService: { login: Mock };
    let fixture: ComponentFixture<SignIn>;
    let component: SignIn;
    let nativeElement: HTMLElement;

    const validValues = {
        username: 'username',
        password: 'password',
    };

    beforeEach(() => {
        toastService = { addToast: vi.fn() };
        lastRouteService = { redirectToLastRoute: vi.fn() };
        authService = { login: vi.fn() };

        TestBed.configureTestingModule({
            imports: [SignIn],
            providers: [
                { provide: ToastService, useValue: toastService },
                { provide: LastRouteService, useValue: lastRouteService },
                { provide: AuthService, useValue: authService },
                provideRouter([]),
            ],
        });

        fixture = TestBed.createComponent(SignIn);
        component = fixture.componentInstance;
        nativeElement = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('go back button', () => {
        const back = nativeElement.querySelector<HTMLButtonElement>('#form-button-back')!;
        back.click();

        expect(lastRouteService.redirectToLastRoute).toHaveBeenCalledOnce();
    });

    it('does not submit when form is invalid', () => {
        component.onSubmit();

        expect(authService.login).not.toHaveBeenCalled();
        expect(toastService.addToast).not.toHaveBeenCalled();
        expect(lastRouteService.redirectToLastRoute).not.toHaveBeenCalled();
    });

    it('Validator testing', () => {
        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;

        component.loginForm.setValue({ username: '', password: '' });
        component.loginForm.markAllAsTouched();
        component.loginForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(true);

        component.loginForm.setValue({ username: 'username', password: '' });
        component.loginForm.markAllAsTouched();
        component.loginForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(true);

        component.loginForm.setValue({ username: '', password: 'password' });
        component.loginForm.markAllAsTouched();
        component.loginForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(true);

        component.loginForm.setValue(validValues);
        component.loginForm.markAllAsTouched();
        component.loginForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(submit.disabled).toBe(false);
    });

    it('disables submit while waiting', () => {
        const pending = new Subject<unknown>();
        authService.login.mockReturnValue(pending.asObservable());

        component.loginForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        expect(submit.disabled).toBe(false);

        submit.click();
        fixture.detectChanges();

        expect(submit.disabled).toBe(true);

        pending.complete();
    });

    it('successful sign in', () => {
        authService.login.mockReturnValue(of(null));

        component.loginForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(authService.login).toHaveBeenCalledOnce();
        expect(authService.login).toHaveBeenCalledWith({
            username: 'username',
            password: 'password',
        });
        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('Successful sign in!', 'success');
        expect(lastRouteService.redirectToLastRoute).toHaveBeenCalledOnce();
    });

    it('invalid credentials', () => {
        authService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' })));

        component.loginForm.setValue(validValues);
        fixture.detectChanges();

        const submit = nativeElement.querySelector<HTMLButtonElement>('#form-button-submit')!;
        submit.click();
        fixture.detectChanges();

        expect(toastService.addToast).toHaveBeenCalledOnce();
        expect(toastService.addToast).toHaveBeenCalledWith('Username or password invalid!', 'error');
        expect(lastRouteService.redirectToLastRoute).not.toHaveBeenCalled();
    });
});
