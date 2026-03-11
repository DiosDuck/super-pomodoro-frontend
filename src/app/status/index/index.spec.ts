import { Component, input } from '@angular/core';
import { StatusRequest } from '../status.service';
import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Index } from '.';

@Component({
  selector: 'app-status-line',
  template: '<div>{{status().name}}</div>'
})
class LineStub {
    status = input.required<StatusRequest>();
}

describe('Status Index Component', () => {
    it('create status lines', async () => {
        await TestBed.configureTestingModule({
            imports: [Index],
        }).overrideComponent(
            Index, {set: {imports: [LineStub]}}
        ).compileComponents();

        const fixure = TestBed.createComponent(Index);
        fixure.detectChanges();

        expect(fixure.nativeElement.querySelectorAll('app-status-line').length).toBe(3);
    });
});
