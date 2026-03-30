import { computed, Injectable, signal } from '@angular/core';
import { Settings, SettingsService } from './settings.service';
import { CycleService, cycleType } from './cycle.service';
import { WorkSessionService } from './work-session.service';
import { Timer, TimerFactory } from './timer.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
    private sessionTimer: Timer;
    private waitingTimer: Timer;
    private settings: Settings;
    private totalSessionTime: number;
    private currentCycleTypeSubject = new BehaviorSubject<cycleType>('idle');
    private currentNumberOfCyclesSubject = new BehaviorSubject<number>(0);
    private timerSubject = new BehaviorSubject<number>(0);
    private timerStartedSubject = new BehaviorSubject<boolean>(false);
    private timerDecrementingSubject = new BehaviorSubject<boolean>(false);
    private isWaitingForConfimationSubject = new BehaviorSubject<boolean>(false);

    public timer$ = this.timerSubject.asObservable();
    public timerStarted$ = this.timerStartedSubject.asObservable();
    public timerDecrementing$ = this.timerDecrementingSubject.asObservable();
    public isWaitingForConfirmation$ = this.isWaitingForConfimationSubject.asObservable();
    public currentCycleType$ = this.currentCycleTypeSubject.asObservable();
    public currentNumberOfCycles$ = this.currentNumberOfCyclesSubject.asObservable();

    constructor(
        private readonly cycleService: CycleService,
        private readonly workSessionService: WorkSessionService,
        settingService: SettingsService,
        timerFactory: TimerFactory,
    ) {
        // timers setting
        this.sessionTimer = timerFactory.getNewTimer();
        this.waitingTimer = timerFactory.getNewTimer();

        // settings setting and initial values
        this.settings = settingService.getSettings();
        this.totalSessionTime = this._getSeconds();
        this.sessionTimer.setTime(this.totalSessionTime);
        settingService.settings$.subscribe(
            settings => this.onSettingsChanged(settings)
        );

        // timer value
        this.timerSubject.next(this.totalSessionTime);
        this.sessionTimer.remainingSeconds$.subscribe(
            time => {
                if (!this.isWaitingForConfimationSubject.value) {
                    console.log('session timer ' + time);
                    this.timerSubject.next(time);
                }
            }
        );
        this.waitingTimer.remainingSeconds$.subscribe(
            time => {
                if (this.isWaitingForConfimationSubject.value) {
                    console.log('waiting timer ' + time);
                    this.timerSubject.next(time);
                }
            }
        );

        // when timer status changes
        this.sessionTimer.timerChanged$.subscribe(
            () => {
                if (!this.isWaitingForConfimationSubject.value) {
                    this.timerStartedSubject.next(this.sessionTimer.isTimerStarted);
                    this.timerDecrementingSubject.next(this.sessionTimer.isTimerDecrementing);
                }
            }
        );
        this.waitingTimer.timerChanged$.subscribe(
            () => {
                if (this.isWaitingForConfimationSubject.value) {
                    this.timerStartedSubject.next(this.waitingTimer.isTimerStarted);
                    this.timerDecrementingSubject.next(this.waitingTimer.isTimerDecrementing);
                }
            }
        );
        
        // extra events
        this.sessionTimer.finish$.subscribe(
            () => {
                this.finishSession();
            }
        );
        this.waitingTimer.finish$.subscribe(
            () => this.pomodoroReset()
        );
        this.cycleService.cycle$.subscribe(
            cycle => {
                this.currentCycleTypeSubject.next(cycle.currentCycle);
                this.currentNumberOfCyclesSubject.next(cycle.currentNumberOfCycle);
            }
        );
    }

    pomodoroStart(): void
    {
        this.cycleService.start();
        this.updateTotalAndSessionTimer();
        this.sessionTimer.start();
    }

    pomodoroContinue(): void
    {
        this.sessionTimer.continue();
    }

    pomodoroIncrement(seconds: number): void
    {
        this.totalSessionTime += seconds;
        this.sessionTimer.addTime(seconds);
    }

    pomodoroRewind(): void
    {
        this.sessionTimer.reset();
        this.updateTotalAndSessionTimer();
    }

    pomodoroReset(): void
    {
        this.sessionTimer.reset();
        this.waitingTimer.reset();
        this.isWaitingForConfimationSubject.next(false);
        this.cycleService.reset();
        this.updateTotalAndSessionTimer();
    }

    pomodoroStop(): void
    {
        this.sessionTimer.stop();
    }

    pomodoroNext(): void
    {
        this.waitingTimer.reset(); 
        this.sessionTimer.reset();
        this.nextStep();
    }

    private _getSeconds(): number
    {
        let time: number;

        switch (this.cycleService.getCycleType()) {
            case 'idle':
            case 'work':
                time = this.settings.workTime;
                break;
            case 'short-break':
                time = this.settings.shortBreakTime;
                break;
            case 'long-break':
                time = this.settings.longBreakTime;
                break;
        }

        return time * 60;
    }

    private finishSession(): void
    {
        this.sessionTimer.reset();

        if (this.settings.enableWaiting) {
            this.confirmationWaiting();
        } else {
            this.nextStep();
        }
    }

    private confirmationWaiting(): void
    {
        this.isWaitingForConfimationSubject.next(true);
        this.waitingTimer.setTime(this.settings.maxConfirmationTime * 60);
        this.waitingTimer.start();
    }

    private nextStep(): void
    {
        this.isWaitingForConfimationSubject.next(false);
        if (this.cycleService.getCycleType() === 'work') {
            this.workSessionService.saveNewToastService(this.totalSessionTime);
        }

        this.cycleService.next(this.settings);
        this.updateTotalAndSessionTimer();
    }

    private onSettingsChanged(settings: Settings): void
    {
        this.settings = settings;
        this.updateTotalAndSessionTimer();
    }

    private updateTotalAndSessionTimer(): void
    {
        this.totalSessionTime = this._getSeconds();
        this.sessionTimer.setTime(this.totalSessionTime);
    }
}
