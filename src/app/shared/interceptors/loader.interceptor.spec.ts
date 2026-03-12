import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { loaderInterceptor } from "./loader.interceptor";
import { LoaderService } from "../utils/loader.service";

describe('Loader Interceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let loaderService: LoaderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([loaderInterceptor])),
                provideHttpClientTesting(),
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        loaderService = TestBed.inject(LoaderService);
    })

    afterEach(() => httpMock.verify());

    it('Request loader skipped', () => {
        expect(loaderService.loader()).toBe(false);

        http.get('/api/test').subscribe();
        const req = httpMock.expectOne('/api/test');
        expect(loaderService.loader()).toBe(false);

        req.flush({ok: true});
        expect(loaderService.loader()).toBe(false);
    });

    it('Request loader activated', () => {
        expect(loaderService.loader()).toBe(false);

        http.get('/api/profile').subscribe();
        const req = httpMock.expectOne('/api/profile');
        expect(loaderService.loader()).toBe(true);

        req.flush({ok: true});
        expect(loaderService.loader()).toBe(false);
    });
});
