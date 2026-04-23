import {
    Component,
    computed,
    inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Cycle, CycleService } from '../services/cycle.service';
import { Settings, SettingsService } from '../services/settings.service';
import { Timer } from '../services/timer.service';
import { WorkSessionService } from '../services/work-session.service';

@Component({
    selector: 'app-pomodoro-index',
    imports: [RouterLink],
    templateUrl: './index.html',
    styleUrl: './index.scss',
})
export class Index implements OnInit, OnDestroy {
    cycleService = inject(CycleService);
    settingsService = inject(SettingsService);
    workSessionService = inject(WorkSessionService);
    timer = inject(Timer);
    title = inject(Title);

    cycle = signal<Cycle>(CycleService.getDefaultCycle());
    settings = signal<Settings>(SettingsService.getDefaultSettings());
    numberOfCycles = computed(() => this.cycle().currentNumberOfCycle - 1);
    cycleState = computed(() => this.cycle().currentCycle);
    header = computed(() => {
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
    time = signal(0);
    minutes = computed(() =>
        Math.floor(this.time() / 60)
            .toString()
            .padStart(2, '0'),
    );
    seconds = computed(() => (this.time() % 60).toString().padStart(2, '0'));
    isWaitingForConfirmation = signal(false);
    timerStarted = signal(false);
    timerDecrementing = signal(false);
    alarm: HTMLAudioElement = new Audio('assets/audio/alarm-clock.mp3');

    ngOnInit(): void {
        this.cycleService.cycle$.subscribe((cycle) => {
            this.cycle.set({ ...cycle });
            this.setTimeOnSettingsAndCycleChange();
        });

        this.settingsService.settings$.subscribe((settings) => {
            this.settings.set({ ...settings });
            this.setTimeOnSettingsAndCycleChange();
        });

        this.timer.remainingTime$.subscribe((seconds) => {
            if (!this.isWaitingForConfirmation()) {
                this.time.set(seconds);
                this.title.setTitle(this.getTitleName());
            }
        });

        this.timer.remainingConfirmationTime$.subscribe((seconds) => {
            if (this.isWaitingForConfirmation()) {
                this.time.set(seconds);
                this.title.setTitle(this.getTitleName());
            }
        });

        this.timer.finishTime$.subscribe((seconds) => {
            this.isWaitingForConfirmation.set(false);
            this.alarm.pause();
            this.timerStarted.set(false);
            this.timerDecrementing.set(false);
            if (this.cycleState() === 'work') {
                this.workSessionService.saveNewWorkSession(seconds);
            }
            this.cycleService.nextCycle(this.settings());
        });

        this.timer.confirmationTimeStarted$.subscribe(() => {
            this.alarm.currentTime = 0;
            this.alarm.play();
            this.isWaitingForConfirmation.set(true);
        });

        this.timer.finishConfirmationTime$.subscribe(() => {
            this.isWaitingForConfirmation.set(false);
            this.onReset();
        });
    }

    ngOnDestroy(): void {
        this.timer.resetTimer();
    }

    onStart(): void {
        if (this.timerStarted()) {
            this.timer.continueTimer();
        } else {
            this.alarm?.pause();
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
        this.timer.addTime(count);
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
