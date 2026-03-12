import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { adminGuard, signedGuard, unsignedGuard } from "./user-state.guard";
import { User, UserService } from "../../auth/auth.service";
import { of } from "rxjs";
import { RouterTestingHarness } from "@angular/router/testing";

@Component({template: '<h1>Protected Page</h1>', selector: 'protected'})
class Protected{}

@Component({template: '<h1>Home Page</h1>', selector: 'home'})
class Home {}

@Component({template: '<h1>Login Page</h1>', selector: 'login'})
class Login {}

const user: User = {
    displayName: 'Test',
    username: 'test',
    email: 'test@email.com',
    roles: ['ROLE_USER'],
    activatedAtTimeStamp: 0,
};

const admin: User = {
    displayName: 'Admin',
    username: 'admin',
    email: 'admin@email.com',
    roles: ['ROLE_USER', 'ROLE_ADMIN'],
    activatedAtTimeStamp: 0,
};

describe('Unsigned Guard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {path: 'auth/sign-in', component: Login, canActivate: [unsignedGuard]},
                    {path: '', pathMatch: 'full', component: Home},
                ])
            ]
        })
    })

    it('allowed', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useValue: {waitFirstUser: () => of(null)}}
            ]
        })

        let harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/auth/sign-in');
        expect(harness.routeNativeElement?.textContent).toContain('Login Page');
    })

    it('not allowed', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useValue: {waitFirstUser: () => of(user)}}
            ]
        })

        let harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/auth/sign-in');
        expect(harness.routeNativeElement?.textContent).toContain('Home Page');
    })
});

describe('Signed Guard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {path: 'protected', component: Protected, canActivate: [signedGuard]},
                    {path: 'auth/sign-in', component: Login},
                ])
            ]
        })
    })

    it('allowed', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useValue: {waitFirstUser: () => of(user)}}
            ]
        })

        let harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('protected');
        expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
    })

    it('not allowed', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useValue: {waitFirstUser: () => of(null)}}
            ]
        })

        let harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('protected');
        expect(harness.routeNativeElement?.textContent).toContain('Login Page');
    })
});

describe('Admin Guard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {path: 'protected', component: Protected, canActivate: [adminGuard]},
                    {path: '', pathMatch: 'full', component: Home},
                ])
            ]
        })
    })

    it('allowed', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useValue: {waitFirstUser: () => of(admin)}}
            ]
        })

        let harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('protected');
        expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
    })

    it('not allowed', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useValue: {waitFirstUser: () => of(user)}}
            ]
        })

        let harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('protected');
        expect(harness.routeNativeElement?.textContent).toContain('Home Page');
    })
});
