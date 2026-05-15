import { ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChangePassword } from "./change-password";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ToastService } from "../../../shared/utils/toast.service";
import { provideHttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

describe('Change Password Component', () => {
    let fixture: ComponentFixture<ChangePassword>;
    let httpMock: HttpTestingController;
    let component: ChangePassword;
    let toastService: ToastService;
    const routerMock = {
        navigateByUrl: vi.fn().mockResolvedValue(true),
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ChangePassword],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {provide: Router, useValue: routerMock},
            ]
        });

        fixture = TestBed.createComponent(ChangePassword);
        httpMock = TestBed.inject(HttpTestingController);
        toastService = TestBed.inject(ToastService);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('does not submit when form is invalid', () => {
        component.onSubmit();

        httpMock.expectNone('/api/auth/password/change-password');
        expect(toastService.toastList().length).toBe(0);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it('Validator testing', () => {
        let nativeElement: HTMLElement = fixture.nativeElement;

        component.changePasswordForm.setValue({
            oldPassword: '',
            newPassword: 'new_password',
            confirmPassword: 'new_password',
        });
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#oldPassword')?.classList.contains('invalid')).toBe(true);
        expect(nativeElement.querySelector('#newPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(false);

        component.changePasswordForm.setValue({
            oldPassword: 'old_password',
            newPassword: 'different_password',
            confirmPassword: 'new_password',
        });
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#oldPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#newPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(true);

        component.changePasswordForm.setValue({
            oldPassword: 'old_password',
            newPassword: 'new_password',
            confirmPassword: 'new_password',
        });
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        fixture.detectChanges();
        expect(nativeElement.querySelector('#oldPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#newPassword')?.classList.contains('invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('invalid')).toBe(false);
    });

    it('Invalid input', () => {
        component.changePasswordForm.setValue({
            oldPassword: 'wrong_password',
            newPassword: 'new_password',
            confirmPassword: 'new_password',
        });
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        component.onSubmit();

        let req = httpMock.expectOne('/api/auth/password/change-password');
        req.flush({message: 'error'}, {status: 400, statusText: 'Invalid Input'});

        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0].status).toEqual('error');
    });

    it('Valid input', () => {
        component.changePasswordForm.setValue({
            oldPassword: 'right_password',
            newPassword: 'new_password',
            confirmPassword: 'new_password',
        });
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        component.onSubmit();

        let req = httpMock.expectOne('/api/auth/password/change-password');
        req.flush({message: 'success'});

        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0].status).toEqual('note');
        expect(toastService.toastList()[0].message).toEqual('Password has been changed, please log in.');
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in');
    })
});
