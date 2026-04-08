import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../../auth/auth.service";
import { ToastService } from "../../shared/utils/toast.service";
import { of } from "rxjs";
import { WorkSessionService } from "./work-session.service";

describe('Work Session Service', () => {
    const toastServiceMock = { addToast: vi.fn() };
    const userServiceMock = { waitFirstUser: vi.fn() };
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: UserService, useValue: userServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    })

    it('no user', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        let workSessionService = TestBed.inject(WorkSessionService);
        workSessionService.saveNewWorkSession(1500);
        httpMock.expectNone('/api/pomodoro/session');
    });

    it('with user success', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of({
            username: 'test',
            email: 'test@email.com',
            displayName: 'Test',
            roles: ['ROLE_USER'],
            activatedAtTimeStamp: 0
        }));

        let workSessionService = TestBed.inject(WorkSessionService);
        workSessionService.saveNewWorkSession(1600);
        let req = httpMock.expectOne('/api/pomodoro/session');
        req.flush({message: 'success'});
        expect(toastServiceMock.addToast).toBeCalledWith('Saved to your profile', 'note');
    });

    it('with user failure', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of({
            username: 'test',
            email: 'test@email.com',
            displayName: 'Test',
            roles: ['ROLE_USER'],
            activatedAtTimeStamp: 0
        }));

        let workSessionService = TestBed.inject(WorkSessionService);
        workSessionService.saveNewWorkSession(1600);
        let req = httpMock.expectOne('/api/pomodoro/session');
        req.flush({message: 'error'}, {status: 500, statusText: 'Internal Server Error'});
        expect(toastServiceMock.addToast).toBeCalledWith('There has been an error saving', 'error');
    });
});
