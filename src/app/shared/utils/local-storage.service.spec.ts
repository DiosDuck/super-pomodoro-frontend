import { TestBed } from "@angular/core/testing";
import { LocalStorageService } from "./local-storage.service";
import { describe, beforeEach, it, expect } from 'vitest';

describe('LocalStorageService', () => {
    let localStorageService: LocalStorageService;

    beforeEach(() => {
        localStorageService = TestBed.inject(LocalStorageService);
    });

    it('getting setting and removing string element', () => {
        expect(localStorageService.get('test')).toBeNull();

        localStorageService.set('test', 'abc');
        expect(localStorageService.get('test')).toBe('abc');

        localStorageService.remove('test');
        expect(localStorageService.get('test')).toBeNull();
    });

    it('getting setting and removing interface element', () => {
        expect(localStorageService.getJsonParsed('test')).toBeNull();

        localStorageService.parseAndSet('test', {foo: 'bar'});
        expect(localStorageService.getJsonParsed('test')).toEqual({foo: 'bar'});

        localStorageService.remove('test');
        expect(localStorageService.get('test')).toBeNull();
    })
});
