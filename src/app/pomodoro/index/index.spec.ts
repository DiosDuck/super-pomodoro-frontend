import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { ALARM_AUDIO, Index as PomodoroIndex } from ".";
import { BehaviorSubject, Observable } from "rxjs";
import { Cycle, CycleService, CycleType } from "../services/cycle.service";
import { SettingsService, Settings } from "../services/settings.service";
import { WorkSessionService } from "../services/work-session.service";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";

describe('Pomodor Index', () => {
    const cycleSubject = new BehaviorSubject<Cycle>(CycleService.getDefaultCycle());
    let cycleServiceMock: {
        start: Mock,
        reset: Mock,
        nextCycle: Mock,
        cycle$: Observable<Cycle>,
    };
    const settingsSubject = new BehaviorSubject<Settings>(SettingsService.getDefaultSettings());
    const settingsServiceMock = {
        settings$: settingsSubject.asObservable(),
    };
    let workSessionServiceMock: {
        saveNewWorkSession: Mock,
    };
    const routerMock = {
        navigateByUrl: vi.fn(),
    };
    let alarmMock: {
        pause: Mock,
        play: Mock,
        currentTime: number,
    };

    let fixure: ComponentFixture<PomodoroIndex>;
    let title: Title;
    
    beforeEach(() => {
        vi.useFakeTimers();
        cycleSubject.next(CycleService.getDefaultCycle());
        settingsSubject.next(SettingsService.getDefaultSettings());
        cycleServiceMock = {
            start: vi.fn(),
            reset: vi.fn(),
            nextCycle: vi.fn(),
            cycle$: cycleSubject.asObservable(),
        }
        alarmMock = {
            pause: vi.fn(),
            play: vi.fn(),
            currentTime: 0,
        };
        workSessionServiceMock = {
            saveNewWorkSession: vi.fn(),
        };

        TestBed.configureTestingModule({
            imports: [PomodoroIndex],
            providers: [
                { provide: CycleService, useValue: cycleServiceMock },
                { provide: SettingsService, useValue: settingsServiceMock },
                { provide: WorkSessionService, useValue: workSessionServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ALARM_AUDIO, useValue: alarmMock },
            ]
        });

        fixure = TestBed.createComponent(PomodoroIndex);
        title = TestBed.inject(Title);
    });

    it.each<{ cycleType: CycleType, expectedTitle: string, expectedHeader: string }>([
        {
            cycleType: 'idle',
            expectedHeader: 'Welcome to pomodoro!',
            expectedTitle: 'Pomodoro',
        },
        {
            cycleType: 'work',
            expectedHeader: 'Show time!',
            expectedTitle: 'Work 25:00',
        },
        {
            cycleType: 'short-break',
            expectedHeader: 'Short break',
            expectedTitle: 'Break 05:00',
        },
        {
            cycleType: 'long-break',
            expectedHeader: 'Long break',
            expectedTitle: 'Break 15:00',
        },
    ])
    (`load page for $cycleType`, ({cycleType, expectedHeader, expectedTitle}) => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: cycleType});
        const title = TestBed.inject(Title);
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();
        
        expect(title.getTitle()).toEqual(expectedTitle);
        expect(pomodoro.header()).toEqual(expectedHeader);
    });

    it('start timer and check after 30 seconds', () => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: 'work'});
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        let settingsButton = fixure.nativeElement.querySelector('#pomodoro-button-settings') as HTMLButtonElement;
        expect(settingsButton.disabled).toBe(false);

        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        expect(cycleServiceMock.start).toHaveBeenCalledOnce();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 24:30');
        expect(pomodoro.header()).toEqual('Show time!');
        expect(settingsButton.disabled).toBe(true);
    });

    it('start timer, wait 30 seconds, pause, wait 30 seconds, then rewind', () => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: 'work'});
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        let settingsButton = fixure.nativeElement.querySelector('#pomodoro-button-settings') as HTMLButtonElement;
        expect(settingsButton.disabled).toBe(false);
        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        let pauseButton = fixure.nativeElement.querySelector('#pomodoro-button-pause') as HTMLButtonElement;
        pauseButton.click();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 24:30');
        expect(pomodoro.header()).toEqual('Show time!');
        expect(settingsButton.disabled).toBe(true);


        let rewindButton = fixure.nativeElement.querySelector('#pomodoro-button-rewind') as HTMLButtonElement;
        rewindButton.click();
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 25:00');
        expect(pomodoro.header()).toEqual('Show time!');
        expect(settingsButton.disabled).toBe(false);
    });

    it('start timer, wait 30 seconds, pause, then start again', () => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: 'work'});
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        let settingsButton = fixure.nativeElement.querySelector('#pomodoro-button-settings') as HTMLButtonElement;
        expect(settingsButton.disabled).toBe(false);
        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        let pauseButton = fixure.nativeElement.querySelector('#pomodoro-button-pause') as HTMLButtonElement;
        pauseButton.click();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 24:30');
        expect(pomodoro.header()).toEqual('Show time!');
        expect(settingsButton.disabled).toBe(true);

        startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 24:00');
        expect(settingsButton.disabled).toBe(true);
    });

    it('reset timer', () => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentNumberOfCycle: 5, currentCycle: 'short-break'});
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Break 05:00');
        expect(pomodoro.header()).toEqual('Short break');
        expect(pomodoro.numberOfCycles()).toEqual(4);

        let resetButton = fixure.nativeElement.querySelector('#pomodoro-button-reset') as HTMLButtonElement;
        expect(resetButton.disabled).toBe(false);
        resetButton.click();

        expect(cycleServiceMock.reset).toHaveBeenCalledOnce();
    });

    it('clicking settings', () => {
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        let settingsButton = fixure.nativeElement.querySelector('#pomodoro-button-settings') as HTMLButtonElement;
        expect(settingsButton.disabled).toBe(false);
        settingsButton.click();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/pomodoro/settings')
    });

    it.each([
        {
            button: '#pomodoro-button-increase-by-5',
            incrementedTime: '29:30',
            minutes: 5,
        },
        {
            button: '#pomodoro-button-increase-by-15',
            incrementedTime: '39:30',
            minutes: 5,
        },
    ])
    ('increment worktime by $minutes minutes then rewind', ({button, incrementedTime}) => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: 'work' });
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();
        
        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        vi.advanceTimersByTime(30000);
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 24:30');
        expect(pomodoro.header()).toEqual('Show time!');
        
        let incrementButton = fixure.nativeElement.querySelector(button) as HTMLButtonElement;
        incrementButton.click();
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work ' + incrementedTime);
        let pauseButton = fixure.nativeElement.querySelector('#pomodoro-button-pause') as HTMLButtonElement;
        pauseButton.click();
        fixure.detectChanges();

        let rewindButton = fixure.nativeElement.querySelector('#pomodoro-button-rewind') as HTMLButtonElement;
        rewindButton.click();
        fixure.detectChanges();

        expect(title.getTitle()).toEqual('Work 25:00');
    });

    it.each<{ currentCycle: CycleType }>([
        {
            currentCycle: 'short-break',
        },
        {
            currentCycle: 'long-break',
        }
    ])
    ('press next for $currentCycle step to skip to \'work\'', ({currentCycle}) => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: currentCycle });
        fixure.detectChanges();

        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        fixure.detectChanges();

        let nextButton = fixure.nativeElement.querySelector('#pomodoro-button-next') as HTMLButtonElement;
        nextButton.click();
        fixure.detectChanges();

        expect(cycleServiceMock.nextCycle).toHaveBeenCalledOnce();
    });

    it.each<{ currentCycle: CycleType, time: number, saveNewWorkSessionCount: number }>([
        {
            currentCycle: 'short-break',
            time: 5*60,
            saveNewWorkSessionCount: 0
        },
        {
            currentCycle: 'long-break',
            time: 15*60,
            saveNewWorkSessionCount: 0
        },
        {
            currentCycle: 'work',
            time: 25*60,
            saveNewWorkSessionCount: 1
        }
    ])
    ('next being called when time expires and no confirmation required for $currentCycle', ({currentCycle, time, saveNewWorkSessionCount}) => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: currentCycle });
        let settings = settingsSubject.getValue();
        settingsSubject.next({... settings, enableWaiting: false});
        fixure.detectChanges();

        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        fixure.detectChanges();

        vi.advanceTimersByTime(time*1000);
        fixure.detectChanges();

        expect(alarmMock.pause).toHaveBeenCalledOnce();
        expect(workSessionServiceMock.saveNewWorkSession).toHaveBeenCalledTimes(saveNewWorkSessionCount);
        expect(cycleServiceMock.nextCycle).toHaveBeenCalledOnce();
    });

    it.each<{ currentCycle: CycleType, time: number, saveNewWorkSessionCount: number }>([
        {
            currentCycle: 'short-break',
            time: 5*60,
            saveNewWorkSessionCount: 0
        },
        {
            currentCycle: 'long-break',
            time: 15*60,
            saveNewWorkSessionCount: 0
        },
        {
            currentCycle: 'work',
            time: 25*60,
            saveNewWorkSessionCount: 1
        }
    ])
    ('next being called when time expires and confirmation time required for $currentCycle', ({currentCycle, time, saveNewWorkSessionCount}) => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: currentCycle });
        let settings = settingsSubject.getValue();
        settingsSubject.next({... settings, enableWaiting: true, maxConfirmationTime: 1});
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        fixure.detectChanges();

        vi.advanceTimersByTime(time*1000);
        fixure.detectChanges();

        expect(pomodoro.header()).toEqual('Continue?');
        expect(title.getTitle()).toEqual('Confirm 01:00');
        expect(alarmMock.play).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(5*1000);
        fixure.detectChanges();
        expect(title.getTitle()).toEqual('Confirm 00:55');

        let nextButton = fixure.nativeElement.querySelector('#pomodoro-button-next') as HTMLButtonElement;
        nextButton.click();
        fixure.detectChanges();

        expect(alarmMock.pause).toHaveBeenCalledOnce();
        expect(workSessionServiceMock.saveNewWorkSession).toHaveBeenCalledTimes(saveNewWorkSessionCount);
        expect(cycleServiceMock.nextCycle).toHaveBeenCalledOnce();
    });
    
    it('confirmation time expires', () => {
        let cycle = cycleSubject.getValue();
        cycleSubject.next({... cycle, currentCycle: 'work' });
        let settings = settingsSubject.getValue();
        settingsSubject.next({... settings, enableWaiting: true, maxConfirmationTime: 1});
        const pomodoro = fixure.componentInstance;
        fixure.detectChanges();

        let startsButton = fixure.nativeElement.querySelector('#pomodoro-button-start') as HTMLButtonElement;
        startsButton.click();
        fixure.detectChanges();

        vi.advanceTimersByTime(25*60*1000);
        fixure.detectChanges();

        expect(pomodoro.header()).toEqual('Continue?');
        expect(title.getTitle()).toEqual('Confirm 01:00');
        expect(alarmMock.play).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(60*1000);
        fixure.detectChanges();

        expect(cycleServiceMock.reset).toHaveBeenCalledOnce();
    });
});
