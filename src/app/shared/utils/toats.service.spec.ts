import { TestBed } from "@angular/core/testing";
import { describe, beforeEach, it, expect } from 'vitest';
import { ToastService } from "./toast.service";

describe('ToastService', () => {
    let toastService: ToastService;

    beforeEach(() => {
        toastService = TestBed.inject(ToastService);
    })

    it('test toast service', () => {
        toastService.addToast('Test', "note");
        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0]).toEqual({
            id: 1, message: 'Test', status: 'note', time: 5
        })

        toastService.addToast('Test2', 'success');
        toastService.removeToast(1);
        expect(toastService.toastList().length).toBe(1);
        expect(toastService.toastList()[0]).toEqual({
            id: 2, message: 'Test2', status: 'success', time: 5
        })
    });
})
