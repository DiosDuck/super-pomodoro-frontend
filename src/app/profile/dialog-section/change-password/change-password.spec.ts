import { ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChangePassword } from "./change-password";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ToastService } from "../../../shared/utils/toast.service";
import { provideHttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

describe('Change Password Component', () => {
    let fixure: ComponentFixture<ChangePassword>;
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

        fixure = TestBed.createComponent(ChangePassword);
        httpMock = TestBed.inject(HttpTestingController);
        toastService = TestBed.inject(ToastService);
        component = fixure.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('Validator testing', () => {
        let nativeElement: HTMLElement = fixure.nativeElement;
        let oldPassword = component.changePasswordForm.get('oldPassword');
        let newPassowrd = component.changePasswordForm.get('newPassword');
        let confirmPassword = component.changePasswordForm.get('confirmPassword');

        oldPassword?.setValue('');
        newPassowrd?.setValue('new_password');
        confirmPassword?.setValue('new_password');
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        fixure.detectChanges();
        expect(nativeElement.querySelector('#oldPassword')?.classList.contains('form-page-form__block--invalid')).toBe(true);
        expect(nativeElement.querySelector('#newPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
    
        oldPassword?.setValue('old_password');
        newPassowrd?.setValue('different_password');
        confirmPassword?.setValue('new_password');
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        fixure.detectChanges();
        expect(nativeElement.querySelector('#oldPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
        expect(nativeElement.querySelector('#newPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('form-page-form__block--invalid')).toBe(true);

        oldPassword?.setValue('old_password');
        newPassowrd?.setValue('new_password');
        confirmPassword?.setValue('new_password');
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        fixure.detectChanges();
        expect(nativeElement.querySelector('#oldPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
        expect(nativeElement.querySelector('#newPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
        expect(nativeElement.querySelector('#confirmPassword')?.classList.contains('form-page-form__block--invalid')).toBe(false);
    });

    it('Invalid input', () => {
        let oldPassword = component.changePasswordForm.get('oldPassword');
        let newPassowrd = component.changePasswordForm.get('newPassword');
        let confirmPassword = component.changePasswordForm.get('confirmPassword');

        oldPassword?.setValue('wrong_password');
        newPassowrd?.setValue('new_password');
        confirmPassword?.setValue('new_password');
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        component.onSubmit();

        let req = httpMock.expectOne('/api/auth/password/change-password');
        req.flush({message: 'error'}, {status: 400, statusText: 'Invalid Input'});

        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0].status).toEqual('error');
    });

    it('Valid input', () => {
        let oldPassword = component.changePasswordForm.get('oldPassword');
        let newPassowrd = component.changePasswordForm.get('newPassword');
        let confirmPassword = component.changePasswordForm.get('confirmPassword');

        oldPassword?.setValue('right_password');
        newPassowrd?.setValue('new_password');
        confirmPassword?.setValue('new_password');
        component.changePasswordForm.markAllAsTouched();
        component.changePasswordForm.updateValueAndValidity();
        component.onSubmit();

        let req = httpMock.expectOne('/api/auth/password/change-password');
        req.flush({message: 'success'});

        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0].status).toEqual('note');
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in');
    })
});
