import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { Line } from "./line";
import { HttpTestingController } from "@angular/common/http/testing";

describe('Status Line Component', () => {
    let fixure: ComponentFixture<Line>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [Line],
        });

        fixure = TestBed.createComponent(Line);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    })

    it('Line Component Success', () => {
        fixure.componentRef.setInput('status', { name: 'Test Request Success', url: '/api/test/1', type: 'health'});
        fixure.detectChanges();

        const req = httpMock.expectOne('/api/test/1');
        req.flush({message: 'Test Success', status: 'OK'});

        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__success');
        expect(title.textContent).toEqual('Test Request Success');
    });

    it('Line Component Warning', () => {
        fixure.componentRef.setInput('status', { name: 'Test Request Warning', url: '/api/test/2', type: 'health'});
        fixure.detectChanges();

        const req = httpMock.expectOne('/api/test/2');
        req.flush({message: 'Test Warning', status: 'WARN'});

        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__warning');
        expect(title.textContent).toEqual('Test Request Warning');
    });

    it('Line Component Error', () => {
        fixure.componentRef.setInput('status', { name: 'Test Request Error', url: '/api/test/3', type: 'health'});
        fixure.detectChanges();

        const req = httpMock.expectOne('/api/test/3');
        req.flush({message: 'Test Error', status: 'CRIT'}, {status: 500, statusText: 'Internal Server Error'});

        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__error');
        expect(title.textContent).toEqual('Test Request Error');
    });

    it('Line Component Server Error', () => {
        fixure.componentRef.setInput('status', { name: 'Test Request Server Error', url: '/api/test/4', type: 'health'});
        fixure.detectChanges();

        const req = httpMock.expectOne('/api/test/4');
        req.flush({'message': 'Internal Server Error'}, {status: 500, statusText: 'Internal Server Error'});

        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__error');
        expect(title.textContent).toEqual('Test Request Server Error');
    });

    it('Line Component Value', () => {

        fixure.componentRef.setInput('status', { name: 'Test Request Value', url: '/api/test/5', type: 'value'});
        fixure.detectChanges();

        const req = httpMock.expectOne('/api/test/5');
        req.flush({message: '1.0.0', status: 'OK'});

        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__success');
        expect(result.classList).toContain('status-line--value');
        expect(result.querySelector<HTMLElement>('.status-line__result--status')!.textContent).toEqual('1.0.0');
        expect(title.textContent).toEqual('Test Request Value');
    });
})
