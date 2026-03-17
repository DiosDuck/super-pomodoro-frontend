import { ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteAccount } from "./delete-account";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ToastService } from "../../../shared/utils/toast.service";
import { Router } from "@angular/router";

describe('Delete Account Component', () => {
    let fixure: ComponentFixture<DeleteAccount>;
    let httpMock: HttpTestingController;
    let component: DeleteAccount;
    let toastService: ToastService;
    const routerMock = {
        navigateByUrl: vi.fn().mockResolvedValue(true),
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DeleteAccount],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {provide: Router, useValue: routerMock},
            ]
        });

        fixure = TestBed.createComponent(DeleteAccount);
        httpMock = TestBed.inject(HttpTestingController);
        toastService = TestBed.inject(ToastService);
        component = fixure.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('Validator testing', () => {
        let nativeElement: HTMLElement = fixure.nativeElement;
        let passwordInput: HTMLInputElement = nativeElement.querySelector('#password')!;
        let passwordController = component.deleteAccountForm.get('password')!;

        passwordController.setValue('');
        passwordController.markAsTouched();
        component.deleteAccountForm.updateValueAndValidity();
        fixure.detectChanges();
        expect(passwordInput.classList.contains('form-page-form__block--invalid')).toBe(true);

        passwordController.setValue('right_password');
        passwordController.markAsTouched();
        component.deleteAccountForm.updateValueAndValidity();
        fixure.detectChanges();
        expect(passwordInput.classList.contains('form-page-form__block--invalid')).toBe(false);
    });

    it('Invalid password', () => {
        component.deleteAccountForm.value.password = 'wrong_password';
        component.onSubmit();

        let req = httpMock.expectOne('/api/profile');
        req.flush({message: 'error'}, {status: 400, statusText: 'Bad Input'});

        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0].status).toEqual('error');
    });

    it('Valid passowrd', () => {
        component.deleteAccountForm.value.password = 'right_password';
        component.onSubmit();

        let req = httpMock.expectOne('/api/profile');
        req.flush({message: 'success'});

        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0].status).toEqual('note');
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in');
    });
});
