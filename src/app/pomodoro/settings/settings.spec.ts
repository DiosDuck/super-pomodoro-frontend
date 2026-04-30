import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { Settings as SettingsComponent } from "./settings";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Settings as SettingsModel, SettingsService, POMODORO_SETTINGS_KEY } from "../services/settings.service";
import { Router } from "@angular/router";

describe('Settings Component', () => {
    let fixure: ComponentFixture<SettingsComponent>;
    let component: SettingsComponent;
    let nativeElement: HTMLElement;
    let settingsSubject = new BehaviorSubject<SettingsModel>({
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        cyclesBeforeLongBreak: 4,
        maxConfirmationTime: 1,
        enableWaiting: true,
        type: POMODORO_SETTINGS_KEY,
    });
    const settingsServiceMock = {
        updateSettings: vi.fn(),
        settings$: settingsSubject.asObservable()
    };
    const routerMock = { navigateByUrl: vi.fn().mockResolvedValue(true) };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SettingsComponent],
            providers: [
                { provide: SettingsService, useValue: settingsServiceMock},
                { provide: Router, useValue: routerMock}
            ]
        });

        settingsSubject.next(
            {
                workTime: 25,
                shortBreakTime: 5,
                longBreakTime: 15,
                cyclesBeforeLongBreak: 4,
                maxConfirmationTime: 1,
                enableWaiting: true,
                type: POMODORO_SETTINGS_KEY,
            }
        );
        fixure = TestBed.createComponent(SettingsComponent);
        component = fixure.componentInstance;
        nativeElement = fixure.nativeElement;
    });

    it('loading settings in form', () => {
        fixure.detectChanges();

        expect(nativeElement.querySelector<HTMLInputElement>('#enable-waiting')?.checked).toBe(true);
        expect(nativeElement.querySelector<HTMLInputElement>('#max-confirmation-time')).toBeTruthy();

        settingsSubject.next(
            {
                workTime: 25,
                shortBreakTime: 5,
                longBreakTime: 15,
                cyclesBeforeLongBreak: 4,
                maxConfirmationTime: 1,
                enableWaiting: false,
                type: POMODORO_SETTINGS_KEY,
            }
        );
        fixure.detectChanges();

        expect(nativeElement.querySelector<HTMLInputElement>('#enable-waiting')?.checked).toBe(false);
        expect(nativeElement.querySelector<HTMLInputElement>('#max-confirmation-time')).toBeNull();
    });

    it('validators', () => {
        fixure.detectChanges();

        let workTime = component.settingsForm.get('workTime')!;
        workTime.setValue(-1);
        component.settingsForm.markAllAsTouched();
        component.settingsForm.updateValueAndValidity();
        expect(component.settingsForm.valid).toBe(false);

        workTime.setValue(10);
        component.settingsForm.markAllAsTouched();
        component.settingsForm.updateValueAndValidity();
        expect(component.settingsForm.valid).toBe(true);
    });

    it('go back', () => {
        fixure.detectChanges();

        let goBackButton = nativeElement.querySelector<HTMLButtonElement>('.settings-form__button--secondary')!;
        goBackButton.click();
        expect(routerMock.navigateByUrl).toBeCalledWith('/pomodoro');
    });

    it('submit', () => {
        const valueSubmited = {
            workTime: 30,
            shortBreakTime: 5,
            longBreakTime: 15,
            cyclesBeforeLongBreak: 4,
            maxConfirmationTime: 1,
            enableWaiting: true,
            type: POMODORO_SETTINGS_KEY,
        };
        fixure.detectChanges();

        let workTime = component.settingsForm.get('workTime')!;
        workTime.setValue(30);
        component.settingsForm.markAllAsTouched();
        component.settingsForm.updateValueAndValidity();
        expect(component.settingsForm.valid).toBe(true);

        let submitButton = nativeElement.querySelector<HTMLButtonElement>('.settings-form__button--primary')!;
        settingsServiceMock.updateSettings.mockReturnValue(of(valueSubmited));
        submitButton.click();
        expect(settingsServiceMock.updateSettings).toBeCalledWith(
            valueSubmited
        );
        expect(routerMock.navigateByUrl).toBeCalledWith('/pomodoro');
    });

    it('enable and disable waiting time', () => {
        fixure.detectChanges();
        let enableWaitingTimeCheckBox = nativeElement.querySelector('#enable-waiting') as HTMLInputElement;
        
        enableWaitingTimeCheckBox.click();
        fixure.detectChanges();
        expect(component.enableWaitingTime()).toBe(false);
        expect(component.settingsForm.get('maxConfirmationTime')!.value).toBe(0);
        
        enableWaitingTimeCheckBox.click();
        fixure.detectChanges();
        expect(component.enableWaitingTime()).toBe(true);
    });
});
