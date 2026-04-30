import {
    Component,
    computed,
    DestroyRef,
    inject,
    InjectionToken,
    OnInit,
    signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Cycle, CycleService } from '../services/cycle.service';
import { Settings, SettingsService } from '../services/settings.service';
import { Timer } from '../services/timer.service';
import { WorkSessionService } from '../services/work-session.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

export const ALARM_AUDIO = new InjectionToken<HTMLAudioElement>('alarm-audio', {
    factory: () => new Audio('assets/audio/alarm-clock.mp3'),
});

@Component({
    selector: 'app-pomodoro-index',
    templateUrl: './index.html',
    styleUrl: './index.scss',
})
export class Index implements OnInit {
    private readonly cycleService = inject(CycleService);
    private readonly settingsService = inject(SettingsService);
    private readonly workSessionService = inject(WorkSessionService);
    private readonly timer = inject(Timer);
    private readonly title = inject(Title);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);

    private readonly cycle = signal<Cycle>(CycleService.getDefaultCycle());
    private readonly settings = signal<Settings>(SettingsService.getDefaultSettings());

    public readonly numberOfCycles = computed(() => this.cycle().currentNumberOfCycle - 1);
    public readonly cycleState = computed(() => this.cycle().currentCycle);
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
    public readonly time = signal(0);
    public readonly minutes = computed(() =>
        Math.floor(this.time() / 60)
            .toString()
            .padStart(2, '0'),
    );
    public readonly seconds = computed(() => (this.time() % 60).toString().padStart(2, '0'));
    public readonly isWaitingForConfirmation = signal(false);
    public readonly timerStarted = signal(false);
    public readonly timerDecrementing = signal(false);
    private readonly alarm = inject(ALARM_AUDIO);

    ngOnInit(): void {
        this.cycleService.cycle$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cycle) => {
            this.cycle.set({ ...cycle });
            this.setTimeOnSettingsAndCycleChange();
        });

        this.settingsService.settings$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((settings) => {
            this.settings.set({ ...settings });
            this.setTimeOnSettingsAndCycleChange();
        });

        this.timer.remainingTime$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((seconds) => {
            if (!this.isWaitingForConfirmation()) {
                this.time.set(seconds);
                this.title.setTitle(this.getTitleName());
            }
        });

        this.timer.remainingConfirmationTime$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((seconds) => {
            if (this.isWaitingForConfirmation()) {
                this.time.set(seconds);
                this.title.setTitle(this.getTitleName());
            }
        });

        this.timer.finishTime$
        .pipe(takeUntilDestroyed(this.destroyRef))
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
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
            this.alarm.currentTime = 0;
            this.alarm.play();
            this.isWaitingForConfirmation.set(true);
        });

        this.timer.finishConfirmationTime$
        .pipe(takeUntilDestroyed(this.destroyRef))
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

    private setTimeOnSettingsAndCycleChange(): void {
        let settings = this.settings();
        let cycle = this.cycle();

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
