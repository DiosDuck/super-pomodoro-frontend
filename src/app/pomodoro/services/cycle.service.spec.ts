import { beforeEach, describe, expect, it } from 'vitest';
import {
    Cycle,
    CycleService,
    cycleType,
    POMODORO_CYCLE_KEY,
} from './cycle.service';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from '../../shared/utils/local-storage.service';
import { POMODORO_SETTINGS_KEY, Settings } from './settings.service';

describe('Cycle Service', () => {
    let localStorageService: LocalStorageService;
    interface NextCycleTestCase {
        initialCycle: cycleType;
        initialNumberOfCycles: number;
        expectedCycle: cycleType;
        expectedNumberOfCycles: number;
    }

    beforeEach(() => {
        localStorageService = TestBed.inject(LocalStorageService);
    });

    it('Create empty new Cycle', () => {
        let cycleService = TestBed.inject(CycleService);
        let val: Cycle | undefined;
        cycleService.cycle$.subscribe((value) => (val = value));

        expect(val?.currentCycle).toEqual('idle');
        expect(val?.currentNumberOfCycle).toEqual(1);
    });

    it('Get cycle from LocalStorage', () => {
        let cycle: Cycle = {
            currentCycle: 'short-break',
            currentNumberOfCycle: 2,
            type: POMODORO_CYCLE_KEY,
            dateTime: new Date(),
        };
        localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);

        let cycleService = TestBed.inject(CycleService);
        let val: Cycle | undefined;
        cycleService.cycle$.subscribe((value) => (val = value));

        expect(val).toEqual(cycle);
    });

    it('Get old cycle from LocalStorage', () => {
        let date = new Date();
        date.setDate(date.getDate() - 1);

        let cycle: Cycle = {
            currentCycle: 'short-break',
            currentNumberOfCycle: 2,
            type: POMODORO_CYCLE_KEY,
            dateTime: date,
        };
        localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);

        let cycleService = TestBed.inject(CycleService);
        let val: Cycle | undefined;
        cycleService.cycle$.subscribe((value) => (val = value));

        expect(val?.currentCycle).toEqual('idle');
        expect(val?.currentNumberOfCycle).toEqual(1);
    });

    it('Start on idle cycle', () => {
        let cycle: Cycle = {
            currentCycle: 'idle',
            currentNumberOfCycle: 1,
            type: POMODORO_CYCLE_KEY,
            dateTime: new Date(),
        };
        localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);

        let cycleService = TestBed.inject(CycleService);
        let val: Cycle | undefined;
        cycleService.cycle$.subscribe((value) => (val = value));
        cycleService.start();
        expect(val?.currentCycle).toEqual('work');
        expect(val?.currentNumberOfCycle).toEqual(1);
    });

    it('Start on non idle cycle', () => {
        let cycle: Cycle = {
            currentCycle: 'short-break',
            currentNumberOfCycle: 1,
            type: POMODORO_CYCLE_KEY,
            dateTime: new Date(),
        };
        localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);

        let cycleService = TestBed.inject(CycleService);
        let val: Cycle | undefined;
        cycleService.cycle$.subscribe((value) => (val = value));
        cycleService.start();
        expect(val?.currentCycle).toEqual('short-break');
        expect(val?.currentNumberOfCycle).toEqual(1);
    });

    it('Reset cycle', () => {
        let cycle: Cycle = {
            currentCycle: 'short-break',
            currentNumberOfCycle: 5,
            type: POMODORO_CYCLE_KEY,
            dateTime: new Date(),
        };
        localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);

        let cycleService = TestBed.inject(CycleService);
        let val: Cycle | undefined;
        cycleService.cycle$.subscribe((value) => (val = value));
        cycleService.reset();
        expect(val?.currentCycle).toEqual('idle');
        expect(val?.currentNumberOfCycle).toEqual(1);
    });

    it.each<NextCycleTestCase>([
        {
            initialCycle: 'idle',
            initialNumberOfCycles: 1,
            expectedCycle: 'short-break',
            expectedNumberOfCycles: 2,
        },
        {
            initialCycle: 'work',
            initialNumberOfCycles: 1,
            expectedCycle: 'short-break',
            expectedNumberOfCycles: 2,
        },
        {
            initialCycle: 'work',
            initialNumberOfCycles: 4,
            expectedCycle: 'long-break',
            expectedNumberOfCycles: 5,
        },
        {
            initialCycle: 'short-break',
            initialNumberOfCycles: 2,
            expectedCycle: 'work',
            expectedNumberOfCycles: 2,
        },
        {
            initialCycle: 'long-break',
            initialNumberOfCycles: 2,
            expectedCycle: 'work',
            expectedNumberOfCycles: 2,
        },
    ])(
        'next cycle for $initialCycle and $initialNumberOfCycles cycles',
        ({
            initialCycle,
            initialNumberOfCycles,
            expectedCycle,
            expectedNumberOfCycles,
        }) => {
            let cycle: Cycle = {
                currentCycle: initialCycle,
                currentNumberOfCycle: initialNumberOfCycles,
                type: POMODORO_CYCLE_KEY,
                dateTime: new Date(),
            };
            let settings: Settings = {
                workTime: 25,
                shortBreakTime: 5,
                longBreakTime: 15,
                cyclesBeforeLongBreak: 4,
                maxConfirmationTime: 1,
                enableWaiting: true,
                type: POMODORO_SETTINGS_KEY,
            };
            localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);

            let cycleService = TestBed.inject(CycleService);
            let val: Cycle | undefined;
            cycleService.cycle$.subscribe((value) => (val = value));
            cycleService.nextCycle(settings);
            expect(val?.currentCycle).toEqual(expectedCycle);
            expect(val?.currentNumberOfCycle).toEqual(expectedNumberOfCycles);
        },
    );
});
