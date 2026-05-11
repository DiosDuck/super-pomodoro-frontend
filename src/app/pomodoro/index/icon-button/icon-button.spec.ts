import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { IconButton } from './icon-button';

describe('IconButton', () => {
    let fixture: ComponentFixture<IconButton>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [IconButton],
        });

        fixture = TestBed.createComponent(IconButton);
        fixture.componentRef.setInput('buttonId', 'test-button');
        fixture.componentRef.setInput('icon', 'play');
        fixture.detectChanges();
    });

    it('renders with correct id and icon', () => {
        let button = fixture.nativeElement.querySelector('#test-button') as HTMLButtonElement;
        let use = button.querySelector('use');
        expect(use?.getAttribute('xlink:href')).toEqual('assets/icons/sprite.svg#icon-play');
    });

    it.each([
        { disabled: false, expectedClickCount: 1 },
        { disabled: true, expectedClickCount: 0 },
    ])
    ('click when disabled=$disabled emits $expectedClickCount times', ({ disabled, expectedClickCount }) => {
        let clickCount = 0;
        fixture.componentInstance.clicked.subscribe(() => clickCount++);

        fixture.componentRef.setInput('disabled', disabled);
        fixture.detectChanges();

        let button = fixture.nativeElement.querySelector('#test-button') as HTMLButtonElement;
        button.click();
        expect(clickCount).toBe(expectedClickCount);
    });
});
