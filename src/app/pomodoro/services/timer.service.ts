import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subject, takeUntil, takeWhile } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class Timer {
    private readonly remainingTimeSubject = new BehaviorSubject<number>(0);
    private readonly stopTimeSubject = new Subject<void>();
    private readonly finishTimeSubject = new Subject<number>();
    private readonly confirmationTimeStartedSubject = new Subject<void>();
    private readonly remainingConfirmationTimeSubject =
        new BehaviorSubject<number>(0);
    private readonly stopConfirmationTimeSubject = new Subject<void>();
    private readonly finishConfirmationTimeSubject = new Subject<void>();

    public readonly remainingTime$ = this.remainingTimeSubject.asObservable();
    public readonly finishTime$ = this.finishTimeSubject.asObservable();
    public readonly confirmationTimeStarted$ =
        this.confirmationTimeStartedSubject.asObservable();
    public readonly remainingConfirmationTime$ =
        this.remainingConfirmationTimeSubject.asObservable();
    public readonly finishConfirmationTime$ =
        this.finishConfirmationTimeSubject.asObservable();

    private initialTime = 0;
    private finalTime = 0;
    private confirmationTime: number | false = false;

    setConfirmationTime(seconds: number | false) {
        if (seconds === false || seconds <= 0) {
            this.confirmationTime = false;
        } else {
            this.confirmationTime = seconds;
        }
    }

    setTime(seconds: number) {
        this.initialTime = seconds;
        this.finalTime = seconds;
        this.remainingTimeSubject.next(seconds);
    }

    addTime(seconds: number) {
        this.finalTime += seconds;
        let value = this.remainingTimeSubject.value;
        this.remainingTimeSubject.next(value + seconds);
    }

    startTimer(): void {
        this.timeStarted();
    }

    stopTimer(): void {
        this.stopTime();
    }

    continueTimer(): void {
        this.timeStarted();
    }

    resetTimer(): void {
        this.stopTime();
        this.remainingTimeSubject.next(this.initialTime);
    }

    confirmTimer(): void {
        this.stopTime();
        this.stopConfimationTime();
        this.finishTimeSubject.next(this.finalTime);
    }

    private next(): void {
        this.stopTime();
        if (this.confirmationTime === false) {
            this.finishTimeSubject.next(this.finalTime);
        } else {
            this.confirmationTimeStarted();
        }
    }

    private timeStarted(): void {
        interval(1000)
            .pipe(
                takeUntil(this.stopTimeSubject),
                takeWhile(() => this.remainingTimeSubject.value > 0),
            )
            .subscribe(() => {
                const next = this.remainingTimeSubject.value - 1;
                this.remainingTimeSubject.next(next);

                if (next === 0) {
                    this.next();
                }
            });
    }

    private confirmationTimeStarted(): void {
        this.confirmationTimeStartedSubject.next();
        this.remainingConfirmationTimeSubject.next(
            this.confirmationTime as number,
        );
        interval(1000)
            .pipe(
                takeUntil(this.stopConfirmationTimeSubject),
                takeWhile(
                    () => this.remainingConfirmationTimeSubject.value > 0,
                ),
            )
            .subscribe(() => {
                const next = this.remainingConfirmationTimeSubject.value - 1;
                this.remainingConfirmationTimeSubject.next(next);

                if (next === 0) {
                    this.finishConfirmationTimeSubject.next();
                    this.stopConfirmationTimeSubject.next();
                }
            });
    }

    private stopTime(): void {
        this.stopTimeSubject.next();
    }

    private stopConfimationTime(): void {
        this.stopConfirmationTimeSubject.next();
    }
}
