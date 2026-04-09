import { firstValueFrom, of, skip } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { User, UserService } from "../../auth/auth.service";
import { LocalStorageService } from "../../shared/utils/local-storage.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { ToastService } from "../../shared/utils/toast.service";
import { TestBed } from "@angular/core/testing";
import { Settings, SettingsService, POMODORO_SETTINGS_KEY, SettingsHttp } from "./settings.service";

describe('Settings Service', () => {
    const userServiceMock = { waitFirstUser: vi.fn() };
    let localStorageService: LocalStorageService;
    let httpMock: HttpTestingController;
    let lastSettings: Settings | undefined;
    const toastServiceMock = { addToast: vi.fn() };
    const defaultSettingsHttp: SettingsHttp = {
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        cyclesBeforeLongBreak: 4,
        maxConfirmationTime: 1,
        enableWaiting: true,
    };
    const defaultSettings: Settings = {
        ...defaultSettingsHttp,
        type: POMODORO_SETTINGS_KEY,
    };
    const user: User = {
        username: 'test',
        displayName: 'Test User',
        email: 'test@email.com',
        roles: ['ROLE_USER'],
        activatedAtTimeStamp: 0
    }

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
        lastSettings = undefined;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('Creating new Settings', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );
        
        expect(lastSettings).toEqual(defaultSettings);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY)).toEqual(defaultSettings);
    });

    it('Get Settings from local storage', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        localStorageService.parseAndSet(POMODORO_SETTINGS_KEY, {
            ...defaultSettings,
            workTime: 30,
        });

        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );
        
        expect(lastSettings?.workTime).toBe(30);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY).workTime).toEqual(30);
        expect(settingsService.getSettings()).toEqual(lastSettings);
    });

    it('Update Settings in local storage', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(null));
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );

        settingsService.updateSettings({...defaultSettings, longBreakTime: 60})
            .subscribe(
                settings => {
                    expect(settings.longBreakTime).toEqual(60);
                    expect(lastSettings).toEqual(settings);
                    expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY)).toEqual(settings);
                }
            )
        ;
    });

    it('Get Settings from API', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(user));
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );

        let req = httpMock.expectOne('/api/pomodoro/settings');
        req.flush({...defaultSettingsHttp, workTime: 60});

        expect(lastSettings?.workTime).toBe(60);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY).workTime).toEqual(60);
    });

    it('Create first Settings for user', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(user));
        localStorageService.parseAndSet(POMODORO_SETTINGS_KEY, {
            ...defaultSettings,
            cyclesBeforeLongBreak: 20,
        })
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );

        let req = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'GET'});
        req.flush({message: 'Not found'}, {status: 404, statusText: 'Not Found'});

        let req2 = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'PUT'});
        req2.flush({message: 'ok'});

        expect(lastSettings?.cyclesBeforeLongBreak).toBe(20);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY).cyclesBeforeLongBreak).toEqual(20);
        expect(toastServiceMock.addToast).toHaveBeenLastCalledWith('First settings created', 'note');
    });

    it('Error on getting the Settings for user', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(user));
        localStorageService.parseAndSet(POMODORO_SETTINGS_KEY, {
            ...defaultSettings,
            cyclesBeforeLongBreak: 20,
        })
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );

        let req = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'GET'});
        req.flush({message: 'Not found'}, {status: 404, statusText: 'Not Found'});

        let req2 = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'PUT'});
        req2.flush({message: 'error'}, {status: 500, statusText: 'Internal Server Error'});

        expect(lastSettings?.cyclesBeforeLongBreak).toBe(20);
        expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY).cyclesBeforeLongBreak).toEqual(20);
        expect(toastServiceMock.addToast).toHaveBeenLastCalledWith('Error creating settings, please refresh the page', 'error', 10);
    });

    it('Update Settings for user', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(user));
        localStorageService.parseAndSet(POMODORO_SETTINGS_KEY, {
            ...defaultSettings,
            cyclesBeforeLongBreak: 20,
        })
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );

        let req = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'GET'});
        req.flush({...defaultSettingsHttp, workTime: 60});

        settingsService.updateSettings({...defaultSettings, longBreakTime: 60})
            .subscribe(
                settings => {
                    expect(settings.longBreakTime).toEqual(60);
                    expect(settings.workTime).toBe(defaultSettings.workTime);
                    expect(lastSettings).toEqual(settings);
                    expect(localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY)).toEqual(settings);
                }
            )
        ;

        let req2 = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'POST'});
        req2.flush({message: 'ok'});
    });

    it('Error on Update Settings for user', () => {
        userServiceMock.waitFirstUser.mockReturnValue(of(user));
        localStorageService.parseAndSet(POMODORO_SETTINGS_KEY, {
            ...defaultSettings,
            cyclesBeforeLongBreak: 20,
        })
        
        let settingsService = TestBed.inject(SettingsService);
        settingsService.settings$.subscribe(
            settings => lastSettings = settings
        );

        let req = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'GET'});
        req.flush({...defaultSettingsHttp, workTime: 60});

        settingsService.updateSettings({...defaultSettings, longBreakTime: 60})
            .subscribe({
                next: () => {
                    expect.unreachable('there should be an error');
                },
                error: () => {
                    expect(toastServiceMock.addToast).toHaveBeenLastCalledWith('Error on saving the settings, please try again later on!', 'error', 10);
                }
            })
        ;
        
        let req2 = httpMock.expectOne({url: '/api/pomodoro/settings', method: 'POST'});
        req2.flush({message: 'error'}, {status: 500, statusText: 'Internal Server Error'});
    });
});
