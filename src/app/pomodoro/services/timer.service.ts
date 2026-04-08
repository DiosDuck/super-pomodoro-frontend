import { Injectable } from "@angular/core";
import { BehaviorSubject, interval, Subject, takeUntil, takeWhile } from "rxjs";

export class Timer {
  private stopSubject = new Subject<void>();
  private remainingSecondsSubject = new BehaviorSubject<number>(0);
  private finishSubject = new Subject<void>();
  private timerStatusChangedSubject = new Subject<void>();

  public remainingSeconds$ = this.remainingSecondsSubject.asObservable();
  public finish$ = this.finishSubject.asObservable();
  public timerStatusChanged$ = this.timerStatusChangedSubject.asObservable();

  private timerStarted = false;
  private timerDecrementing = false;

  get isTimerStarted(): boolean 
  {
    return this.timerStarted;
  }

  get isTimerDecrementing(): boolean
  {
    return this.timerDecrementing;
  }

  setTime(time : number): void
  {
    this._stop();

    this.remainingSecondsSubject.next(time);
  }

  start(): void 
  {
    this._stop();

    this.timerStarted = true;
    this.timerDecrementing = true;
    this.timerStatusChangedSubject.next();
    
    this._intervalStarted();
  }

  continue(): void
  {
    this._stop();

    this.timerDecrementing = true;
    this.timerStatusChangedSubject.next();

    this._intervalStarted();
  }

  reset(): void
  {
    this._stop();

    this.timerStarted = false;
    this.timerDecrementing = false;
    this.timerStatusChangedSubject.next();
  }

  addTime(seconds : number): void
  {
    let time = this.remainingSecondsSubject.getValue();
    time += seconds;
    this.remainingSecondsSubject.next(time);
  }

  stop(): void
  {
    this.timerDecrementing = false;
    this.timerStatusChangedSubject.next();
    this._stop();
  }

  private _intervalStarted(): void
  {
    interval(1000)
      .pipe(
        takeUntil(this.stopSubject),
        takeWhile(() => this.remainingSecondsSubject.value > 0),
      )
      .subscribe(() => {
        const next = this.remainingSecondsSubject.value - 1;
        this.remainingSecondsSubject.next(next);

        if (next === 0) {
          this.timerStarted = false;
          this.timerDecrementing = false;
          this.timerStatusChangedSubject.next();
          this.finishSubject.next();
        }
      });
  }

  private _stop(): void
  {
    this.stopSubject.next();
  }
}

@Injectable({
    providedIn: 'root',
})
export class TimerFactory {
    getNewTimer(): Timer
    {
        return new Timer();
    }
}
