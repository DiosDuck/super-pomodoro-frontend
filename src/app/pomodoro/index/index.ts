import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CounterService, cycleType } from '../pomodoro.services';
import { RouterLink } from "@angular/router";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pomodoro-index',
  imports: [RouterLink],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class Index implements OnInit, OnDestroy {
  counterService = inject(CounterService);
  title = inject(Title);
  numberOfCycles = signal<number>(0);
  cycleState = signal<cycleType>('idle');
  header = computed(
    () => {
      if (this.isWaitingForConfirmation()) {
        return 'Continue?'
      }

      switch (this.cycleState()) {
        case 'idle':
          return 'Welcome to pomodoro!';
        case 'work':
          return 'Show time!';
        case 'short-break':
          return 'Short break';
        case 'long-break':
          return 'Long break';
      }
    }
  );
  timer = signal<number>(0);
  minutes = computed(() => Math.floor(this.timer() / 60).toString().padStart(2, "0"));
  seconds = computed(() => (this.timer() % 60).toString().padStart(2, "0"));
  isWaitingForConfirmation = this.counterService.waitingTimer.timerStarted;
  timerStarted = computed(() => this.counterService.sessionTimer.timerDecrementing() || this.counterService.waitingTimer.timerDecrementing());
  sessionStarted = computed(() => this.counterService.sessionTimer.timerStarted() || this.counterService.waitingTimer.timerStarted());;
  alarm : HTMLAudioElement | null = null;

  titleValue = computed(
    () => {
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
  );

  ngOnInit(): void 
  {
    this.alarm = new Audio('assets/audio/alarm-clock.mp3');
    this.counterService.cycle.subscribe((cycle) => {
      this.cycleState.set(cycle.currentCycle);
      this.numberOfCycles.set(cycle.currentNumberOfCycle - 1);
    })
    this.counterService.waitingTimer.remainingSeconds.subscribe((time: number) => {
      if (this.isWaitingForConfirmation()) {
        this.timer.set(time);
        this.title.setTitle(this.titleValue());
      }
    });
    this.counterService.sessionTimer.remainingSeconds.subscribe((time: number) => {
      if (!this.isWaitingForConfirmation()) {
        this.timer.set(time);
        this.title.setTitle(this.titleValue());
      }
    });
    this.counterService.sessionTimer.finish.subscribe(() => {
      if (this.alarm) {
        this.alarm.currentTime = 0;
        this.alarm.play();
      }
    });
  }

  ngOnDestroy(): void {
    this.counterService.pomodoroRewind();
    this.alarm = null;
  }

  onStart(): void
  {
    if (this.sessionStarted()) {
      this.counterService.pomodoroContinue()
    } else {
      this.alarm?.pause();
      this.counterService.pomodoroStart()
    }
  }

  onStop(): void
  {
    this.counterService.pomodoroStop();
  }

  onNext(): void
  {
    this.alarm?.pause();
    this.counterService.pomodoroNext();
  }

  onIncrement(count: number): void
  {
    this.counterService.pomodoroIncrement(count * 60);
  }

  onRewind(): void
  {
    this.counterService.pomodoroRewind();
  }

  onReset(): void
  {
    this.counterService.pomodoroReset();
  }
}
