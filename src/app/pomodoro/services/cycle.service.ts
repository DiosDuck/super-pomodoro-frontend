import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../../shared/utils/local-storage.service';
import { Settings } from './settings.service';

export type CycleType = 'idle' | 'work' | 'short-break' | 'long-break';

export interface Cycle {
    currentCycle: CycleType;
    currentNumberOfCycle: number;
    dateTime: Date;
    type: 'pomodoro.cycle';
}

export const POMODORO_CYCLE_KEY = 'pomodoro.cycle';

@Injectable({
    providedIn: 'root',
})
export class CycleService {
    private readonly cycleSubject = new BehaviorSubject<Cycle>(
        CycleService.getDefaultCycle(),
    );
    public readonly cycle$ = this.cycleSubject.asObservable();

    constructor(private readonly localStorageService: LocalStorageService) {
        this.cycleSubject.next(this.loadCycle());
        this.cycle$.subscribe((cycle) => this.setCycle(cycle));
    }

    reset(): void {
        this.cycleSubject.next(this.createNewCycle());
    }

    nextCycle(settings: Settings): void {
        let cycle = this.cycleSubject.value;
        if (cycle.currentCycle !== 'work' && cycle.currentCycle !== 'idle') {
            cycle.currentCycle = 'work';
        } else {
            if (
                cycle.currentNumberOfCycle % settings.cyclesBeforeLongBreak === 0
            ) {
                cycle.currentCycle = 'long-break';
            } else {
                cycle.currentCycle = 'short-break';
            }

            cycle.currentNumberOfCycle += 1;
        }

        this.cycleSubject.next(cycle);
    }

    start(): void {
        let cycle = this.cycleSubject.value;
        if (cycle.currentCycle === 'idle') {
            cycle.currentCycle = 'work';
            this.cycleSubject.next(cycle);
        }
    }

    static getDefaultCycle(): Cycle {
        return {
            currentCycle: 'idle',
            currentNumberOfCycle: 1,
            dateTime: new Date(),
            type: POMODORO_CYCLE_KEY,
        };
    }

    private loadCycle(): Cycle {
        let data = this.localStorageService.getJsonParsed(POMODORO_CYCLE_KEY);
        if (
            data !== null &&
            'type' in data &&
            data.type === POMODORO_CYCLE_KEY
        ) {
            let convertedData: Cycle = {
                ...data,
                dateTime: new Date(data.dateTime),
            };

            if (this.isValidCycle(convertedData)) {
                return convertedData;
            }
        }

        return this.createNewCycle();
    }

    private createNewCycle(): Cycle {
        let cycle = CycleService.getDefaultCycle();
        this.setCycle(cycle);
        return cycle;
    }

    private isValidCycle(cycle: Cycle): boolean {
        let date = new Date();
        return date.getDate() === cycle.dateTime.getDate();
    }

    private setCycle(cycle: Cycle): void {
        this.localStorageService.parseAndSet(POMODORO_CYCLE_KEY, cycle);
    }
}
