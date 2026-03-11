import { TestBed } from "@angular/core/testing";
import { describe, beforeEach, it, expect } from 'vitest';
import { LoaderService } from "./loader.service";

describe('LoaderService', () => {
    let loaderService: LoaderService;

    beforeEach(() => {
        loaderService = TestBed.inject(LoaderService);
    });

    it('test loader service', () => {
        expect(loaderService.loader()).toBe(false);

        loaderService.startLoading();
        expect(loaderService.loader()).toBe(true);

        loaderService.startLoading();
        loaderService.stopLoading();
        expect(loaderService.loader()).toBe(true);

        loaderService.stopLoading();
        expect(loaderService.loader()).toBe(false);
    })
})