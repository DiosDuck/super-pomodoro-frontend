import { firstValueFrom, of, skip } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../../auth/auth.service";
import { LocalStorageService } from "../../shared/utils/local-storage.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { ToastService } from "../../shared/utils/toast.service";
import { TestBed } from "@angular/core/testing";
import { Settings, SettingsService, POMODORO_SETTINGS_KEY } from "./settings.service";

describe('Settings Service', () => {
    const userServiceMock = { waitFirstUser: vi.fn() };
    let localStorageService: LocalStorageService;
    let httpMock: HttpTestingController;
    const toastServiceMock = { addToast: vi.fn() };
    const defaultSettings: Settings = {
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        cyclesBeforeLongBreak: 4,
        maxConfirmationTime: 1,
        enableWaiting: true,
        type: POMODORO_SETTINGS_KEY,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: UserService, useValue: userServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        localStorageService = TestBed.inject(LocalStorageService);
        localStorageService.remove(POMODORO_SETTINGS_KEY);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('Creating new Settings', async () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        let settingsService = TestBed.inject(SettingsService);
        let settings = await firstValueFrom(settingsService.settings$.pipe(skip(1)));
        expect(settings).toEqual(defaultSettings);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY)).toEqual(defaultSettings);
    });

    it('Get Settings from local storage', async () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        localStorageService.parseAndSet(POMODORO_SETTINGS_KEY, {
            ...defaultSettings,
            workTime: 30,
        })
        let settingsService = TestBed.inject(SettingsService);
        let settings = await firstValueFrom(settingsService.settings$.pipe(skip(1)));
        expect(settings.workTime).toBe(30);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY).workTime).toEqual(30);
    });

    it('Update Settings in local storage', async () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        let settingsService = TestBed.inject(SettingsService);
        // wait before early value is initialized
        await firstValueFrom(settingsService.settings$.pipe(skip(1)));
        settingsService.updateSettings({...defaultSettings, longBreakTime: 60})
            .subscribe(
                settings => {
                    expect(settings.longBreakTime).toEqual(60);
                    expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY)).toEqual(settings);
                }
            )
    });
});
