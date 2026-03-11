import { TestBed } from "@angular/core/testing";
import { describe, beforeEach, it, expect } from 'vitest';
import { StatusResponse, StatusService } from "../status.service";
import { Observable, of } from "rxjs";
import { CommonModule } from "@angular/common";
import { Line } from "./line";

class StatusServiceMockSuccess {
    getResponse(url: string): Observable<StatusResponse> {
        return of({message: 'Test Success', status: 'OK'});
    }
}

class StatusServiceMockWarn {
    getResponse(url: string): Observable<StatusResponse> {
        return of({message: 'Test Warn', status: 'WARN'});
    }
}

class StatusServiceMockCrit {
    getResponse(url: string): Observable<StatusResponse> {
        return of({message: 'Test Crit', status: 'CRIT'});
    }
}

class StatusServiceMockValue {
    getResponse(url: string): Observable<StatusResponse> {
        return of({message: '1.0.0', status: 'OK'});
    }
}

describe('Status Line Component', () => {
    it('Line Component Success', () => {
        TestBed.configureTestingModule({
            imports: [CommonModule],
            providers: [{ provide: StatusService, useClass: StatusServiceMockSuccess}],
        });

        const fixure = TestBed.createComponent(Line);
        fixure.componentRef.setInput('status', { name: 'Test Request Success', url: '/api/test', type: 'health'});
        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__success');
        expect(title.textContent).toEqual('Test Request Success');
    });

    it('Line Component Warning', () => {
        TestBed.configureTestingModule({
            imports: [CommonModule],
            providers: [{ provide: StatusService, useClass: StatusServiceMockWarn}],
        });

        const fixure = TestBed.createComponent(Line);
        fixure.componentRef.setInput('status', { name: 'Test Request Warning', url: '/api/test', type: 'health'});
        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__warning');
        expect(title.textContent).toEqual('Test Request Warning');
    });

    it('Line Component Error', () => {
        TestBed.configureTestingModule({
            imports: [CommonModule],
            providers: [{ provide: StatusService, useClass: StatusServiceMockCrit}],
        });

        const fixure = TestBed.createComponent(Line);
        fixure.componentRef.setInput('status', { name: 'Test Request Error', url: '/api/test', type: 'health'});
        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__error');
        expect(title.textContent).toEqual('Test Request Error');
    });

    it('Line Component Value', () => {
        TestBed.configureTestingModule({
            imports: [CommonModule],
            providers: [{ provide: StatusService, useClass: StatusServiceMockValue}],
        });

        const fixure = TestBed.createComponent(Line);
        fixure.componentRef.setInput('status', { name: 'Test Request Value', url: '/api/test', type: 'value'});
        fixure.detectChanges();

        const title: HTMLElement = fixure.nativeElement.querySelector('.status-line__title');
        const result: HTMLElement = fixure.nativeElement.querySelector('.status-line__result');

        expect(result.classList).toContain('status-line__success');
        expect(result.classList).toContain('status-line--value');
        expect(result.querySelector<HTMLElement>('.status-line__result--status')!.textContent).toEqual('1.0.0');
        expect(title.textContent).toEqual('Test Request Value');
    });
})
