import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NullableUser, UserService } from "../../auth/auth.service";
import { ToastService } from "../../shared/utils/toast.service";
import { BehaviorSubject, Observable } from "rxjs";
import { WorkSessionService } from "./work-session.service";

describe('Work Session Service', () => {
    const toastServiceMock = { addToast: vi.fn() };
    let userServiceMock: { user$: Observable<NullableUser> };
    let userSubject: BehaviorSubject<NullableUser>;
    let workSessionService: WorkSessionService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        userSubject = new BehaviorSubject<NullableUser>(null);
        userServiceMock = {
            user$: userSubject.asObservable()
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: UserService, useValue: userServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        workSessionService = TestBed.inject(WorkSessionService);
    });

    afterEach(() => {
        httpMock.verify();
    })

    it('no user', () => {
        workSessionService.saveNewToastService(1500);
        httpMock.expectNone('/api/pomodoro/session');
    });

    it('with user success', () => {
        userSubject.next({
            username: 'test',
            email: 'test@email.com',
            displayName: 'Test',
            roles: ['ROLE_USER'],
            activatedAtTimeStamp: 0
        });

        workSessionService.saveNewToastService(1600);
        let req = httpMock.expectOne('/api/pomodoro/session');
        req.flush({message: 'success'});
        expect(toastServiceMock.addToast).toBeCalledWith('Saved to your profile', 'note');
    });

    it('with user failure', () => {
        userSubject.next({
            username: 'test',
            email: 'test@email.com',
            displayName: 'Test',
            roles: ['ROLE_USER'],
            activatedAtTimeStamp: 0
        });

        workSessionService.saveNewToastService(1600);
        let req = httpMock.expectOne('/api/pomodoro/session');
        req.flush({message: 'error'}, {status: 500, statusText: 'Internal Server Error'});
        expect(toastServiceMock.addToast).toBeCalledWith('There has been an error saving', 'error');
    });
});
