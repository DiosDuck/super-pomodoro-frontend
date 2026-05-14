import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { verifyEmailRegisterGuard } from "./register.guard";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ToastService } from "../../shared/utils/toast.service";
import { RouterTestingHarness } from "@angular/router/testing";
import { of } from "rxjs";
import { AuthService } from "../auth.service";

@Component({template: '<h1>Sign In</h1>', selector: 'app-sign-in'})
class SignIn {}

@Component({template: '<h1>Home</h1>', selector: 'app-home'})
class Home {}

describe('Verify Email Register Guard', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let toastService: { addToast: Mock };
    let harness: RouterTestingHarness;
    const authService = { logout: () => of(null) }

    beforeEach(async () => {
        toastService = {
            addToast: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([
                    {path: 'auth/verify-email', canMatch: [verifyEmailRegisterGuard], children: []},
                    {path: 'auth/sign-in', component: SignIn},
                    {path: '', pathMatch: 'full', component: Home},
                ]),
                { provide: ToastService, useValue: toastService },
                { provide: AuthService, useValue: authService },
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        harness = await RouterTestingHarness.create();
    });

    afterEach(() => httpMock.verify());

    it('Success redirect', async () => {
        let navigation =harness.navigateByUrl('auth/verify-email?token=abcdef&id=5');
        await new Promise<void>(resolve => setTimeout(resolve));
        
        let req = httpMock.expectOne('/api/auth/register/verify-email');
        req.flush({message: 'OK'});
        await navigation;
        
        expect(harness.routeNativeElement?.textContent).toContain('Sign In');
    });

    it('Error redirect', async () => {
        let navigation = harness.navigateByUrl('auth/verify-email');
        await new Promise<void>(resolve => setTimeout(resolve));
        
        let req = httpMock.expectOne('/api/auth/register/verify-email');
        req.flush({message: 'Error'}, {status: 500, statusText: 'Internal Server Error'});
        await navigation;
        
        expect(harness.routeNativeElement?.textContent).toContain('Home');
    });
});
