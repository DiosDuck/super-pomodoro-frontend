import { describe, expect, it, vi } from "vitest";
import { LastRouteService } from "./last-route.service";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

describe('Last Route Service', () => {
    let successRouter = {navigateByUrl: vi.fn().mockResolvedValue(true), url: '/success'};
    let faultyRouter = {navigateByUrl: vi.fn().mockResolvedValue(false), url: '/faulty'};

    it('redirect to home', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: successRouter}
            ]
        });

        let lastRouteService = TestBed.inject(LastRouteService);
        let result = await lastRouteService.redirectToLastRoute();
        expect(result).toBe(true);
        expect(successRouter.navigateByUrl).toBeCalledWith('/');
    });

    it('redirect to last link', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: successRouter}
            ]
        });

        let lastRouteService = TestBed.inject(LastRouteService);
        lastRouteService.updateLastRoute('/popcorn')
        let result = await lastRouteService.redirectToLastRoute();
        expect(result).toBe(true);
        expect(successRouter.navigateByUrl).toBeCalledWith('/popcorn');
    });

    it('saving null link', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: successRouter}
            ]
        });

        let lastRouteService = TestBed.inject(LastRouteService);
        lastRouteService.updateLastRoute(null)
        let result = await lastRouteService.redirectToLastRoute();
        expect(result).toBe(true);
        expect(successRouter.navigateByUrl).toBeCalledWith('/success');
    });

    it('fail saving auth link', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: successRouter}
            ]
        });

        let lastRouteService = TestBed.inject(LastRouteService);
        lastRouteService.updateLastRoute('/auth/popcorn')
        let result = await lastRouteService.redirectToLastRoute();
        expect(result).toBe(true);
        expect(successRouter.navigateByUrl).toBeCalledWith('/');
    });

    it('fail routing', async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: faultyRouter}
            ]
        });

        let lastRouteService = TestBed.inject(LastRouteService);
        lastRouteService.updateLastRoute('/popcorn')
        let result = await lastRouteService.redirectToLastRoute();
        expect(result).toBe(false);
        expect(faultyRouter.navigateByUrl).toBeCalledWith('/popcorn');
    });
});
