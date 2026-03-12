import { HttpClient, HttpContext, HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userInterceptor } from "./login.interceptor";
import { SKIP_TOKEN, UserToken } from "../../auth/auth.service";

describe('Login Interceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([userInterceptor])),
                provideHttpClientTesting(),
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    })

    afterEach(() => httpMock.verify());

    it('no token exists', () => {
        http.get('/api/test').subscribe();
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBeNull();
        req.flush({message: 'ok'});
    });

    it('skip set', () => {
        http.get('/api/test', {context: new HttpContext().set(SKIP_TOKEN, true)}).subscribe();
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBeNull();
        req.flush({message: 'ok'});
    });

    it('with success token', () => {
        const userToken = TestBed.inject(UserToken);
        userToken.set({token: 'abcdef', refresh_token: '123456'});

        http.get('/api/test').subscribe();
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer abcdef');
        req.flush({message: 'ok'});
    });

    it('with error other than 401', () => {
        const userToken = TestBed.inject(UserToken);
        userToken.set({token: 'abcdef', refresh_token: '123456'});

        http.get('/api/test').subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(500);
            }
        });
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer abcdef');
        req.flush({message: 'error'}, {status: 500, statusText: 'Internal Server Error'});
    });

    it('refresh token success', () => {
        const userToken = TestBed.inject(UserToken);
        userToken.set({token: 'abcdef', refresh_token: '123456'});

        http.get('/api/test').subscribe();
        let req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer abcdef');
        req.flush({message: 'error'}, {status: 401, statusText: 'Unauthorized'});

        req = httpMock.expectOne('/api/auth/token/refresh');
        req.flush({token: 'qwerty', refresh_token: '123456'});
        
        req = httpMock.expectOne('/api/profile');
        req.flush(
            {
                displayName: 'Test',
                username: 'test',
                email: 'test@email.com',
                roles: ['ROLE_USER'],
                activatedAtTimeStamp: 0
            }
        );

        req = httpMock.expectOne('/api/test');
        req.flush({message: 'ok'});

        expect(userToken.getToken()).toBe('qwerty');
    });

    it('refresh token success but error on api', () => {
        const userToken = TestBed.inject(UserToken);
        userToken.set({token: 'abcdef', refresh_token: '123456'});

        http.get('/api/test').subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(500);
            }
        });
        let req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer abcdef');
        req.flush({message: 'error'}, {status: 401, statusText: 'Unauthorized'});

        req = httpMock.expectOne('/api/auth/token/refresh');
        req.flush({token: 'qwerty', refresh_token: '123456'});
        
        req = httpMock.expectOne('/api/profile');
        req.flush(
            {
                displayName: 'Test',
                username: 'test',
                email: 'test@email.com',
                roles: ['ROLE_USER'],
                activatedAtTimeStamp: 0
            }
        );

        req = httpMock.expectOne('/api/test');
        req.flush({message: 'error'}, {status: 500, statusText: 'Internal Server Error'});

        expect(userToken.getToken()).toBe('qwerty');
    });

    it('refresh token error', () => {
        const userToken = TestBed.inject(UserToken);
        userToken.set({token: 'abcdef', refresh_token: '123456'});

        http.get('/api/test').subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(401);
            }
        });
        let req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer abcdef');
        req.flush({message: 'error'}, {status: 401, statusText: 'Unauthorized'});

        req = httpMock.expectOne('/api/auth/token/refresh');
        req.flush({message: 'Unauthorized'}, {status: 401, statusText: 'Unauthorized'});

        expect(userToken.get()).toBeNull();
    });
});
