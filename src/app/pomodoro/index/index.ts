import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Cycle, CycleService } from '../services/cycle.service';
import { Settings, SettingsService } from '../services/settings.service';
import { Timer } from '../services/timer.service';
import { WorkSessionService } from '../services/work-session.service';
import { ALARM_AUDIO } from '../alarm-audio.token';
import { IconButton } from './icon-button/icon-button';

@Component({
    selector: 'app-pomodoro-index',
    templateUrl: './index.html',
    styleUrl: './index.scss',
    imports: [IconButton],
})
export class Index {
    private readonly cycleService = inject(CycleService);
    private readonly settingsService = inject(SettingsService);
    private readonly workSessionService = inject(WorkSessionService);
    private readonly timer = inject(Timer);
    private readonly title = inject(Title);
    private readonly router = inject(Router);
    private readonly alarm = inject(ALARM_AUDIO);

    private readonly cycle = toSignal(this.cycleService.cycle$, {
        initialValue: CycleService.getDefaultCycle(),
    });
    private readonly settings = toSignal(this.settingsService.settings$, {
        initialValue: SettingsService.getDefaultSettings(),
    });
    private readonly remainingTime = toSignal(this.timer.remainingTime$, {
        initialValue: 0,
    });
    private readonly remainingConfirmationTime = toSignal(
        this.timer.remainingConfirmationTime$,
        { initialValue: 0 },
    );

    public readonly numberOfCycles = computed(() => this.cycle().currentNumberOfCycle - 1);
    public readonly cycleState = computed(() => this.cycle().currentCycle);
    public readonly isWaitingForConfirmation = signal(false);
    public readonly timerStarted = signal(false);
    public readonly timerDecrementing = signal(false);

    public readonly time = computed(() =>
        this.isWaitingForConfirmation()
            ? this.remainingConfirmationTime()
            : this.remainingTime(),
    );
    public readonly minutes = computed(() =>
        Math.floor(this.time() / 60)
            .toString()
            .padStart(2, '0'),
    );
    public readonly seconds = computed(() =>
        (this.time() % 60).toString().padStart(2, '0'),
    );
    public readonly header = computed(() => {
        if (this.isWaitingForConfirmation()) {
            return 'Continue?';
        }

        let cycle = this.cycle();
        switch (cycle.currentCycle) {
            case 'idle':
                return 'Welcome to pomodoro!';
            case 'work':
                return 'Show time!';
            case 'short-break':
                return 'Short break';
            case 'long-break':
                return 'Long break';
        }
    });

    constructor() {
        effect(() => {
            this.setTimeOnSettingsAndCycleChange(this.settings(), this.cycle());
        });

        effect(() => {
            this.title.setTitle(this.getTitleName());
        });

        this.timer.finishTime$
            .pipe(takeUntilDestroyed())
            .subscribe((seconds) => {
                this.isWaitingForConfirmation.set(false);
                this.alarm.pause();
                this.timerStarted.set(false);
                this.timerDecrementing.set(false);
                if (this.cycleState() === 'work') {
                    this.workSessionService.saveNewWorkSession(seconds);
                }
                this.cycleService.nextCycle(this.settings());
            });

        this.timer.confirmationTimeStarted$
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.alarm.currentTime = 0;
                this.alarm.play();
                this.isWaitingForConfirmation.set(true);
            });

        this.timer.finishConfirmationTime$
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.isWaitingForConfirmation.set(false);
                this.onReset();
            });
    }

    onStart(): void {
        if (this.timerStarted()) {
            this.timer.continueTimer();
        } else {
            this.timer.startTimer();
            this.timerStarted.set(true);
        }

        this.cycleService.start();
        this.timerDecrementing.set(true);
    }

    onStop(): void {
        this.timer.stopTimer();
        this.timerDecrementing.set(false);
    }

    onNext(): void {
        this.timer.confirmTimer();
    }

    onIncrement(count: number): void {
        this.timer.addTime(count * 60);
    }

    onRewind(): void {
        this.timer.resetTimer();
        this.timerStarted.set(false);
        this.timerDecrementing.set(false);
    }

    onReset(): void {
        this.onRewind();
        this.cycleService.reset();
    }

    onSettings(): void {
        this.router.navigateByUrl('/pomodoro/settings');
    }

    private getTitleName(): string {
        let start: string;
        if (this.isWaitingForConfirmation()) {
            start = 'Confirm';
        } else {
            switch (this.cycleState()) {
                case 'idle':
                    return 'Pomodoro';
                case 'work':
                    start = 'Work';
                    break;
                case 'short-break':
                case 'long-break':
                    start = 'Break';
                    break;
            }
        }

        return `${start} ${this.minutes()}:${this.seconds()}`;
    }

    private setTimeOnSettingsAndCycleChange(settings: Settings, cycle: Cycle): void {
        this.timer.setConfirmationTime(
            settings.enableWaiting ? settings.maxConfirmationTime * 60 : false,
        );

        let time: number;
        switch (cycle.currentCycle) {
            case 'idle':
            case 'work':
                time = settings.workTime;
                break;
            case 'short-break':
                time = settings.shortBreakTime;
                break;
            case 'long-break':
                time = settings.longBreakTime;
                break;
        }

        this.timer.setTime(time * 60);
    }
}
