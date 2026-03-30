import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CounterService } from '../services/counter.service';
import { Title } from '@angular/platform-browser';
import { cycleType } from '../services/cycle.service';

@Component({
  selector: 'app-pomodoro-index',
  imports: [RouterLink],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class Index implements OnInit, OnDestroy {
  counterService = inject(CounterService);
  title = inject(Title);
  numberOfCycles = signal(0);
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
  timer = signal(0);
  minutes = computed(() => Math.floor(this.timer() / 60).toString().padStart(2, "0"));
  seconds = computed(() => (this.timer() % 60).toString().padStart(2, "0"));
  isWaitingForConfirmation = signal(false);
  timerStarted = signal(false);
  timerDecrementing = signal(false);
  alarm : HTMLAudioElement = new Audio('assets/audio/alarm-clock.mp3');

  ngOnInit(): void {
    this.counterService.timer$.subscribe(
      val => {
        this.timer.set(val);
        this.title.setTitle(this.getTitleName());
      }
    );
    this.counterService.timerStarted$.subscribe(
      val => this.timerStarted.set(val)
    );
    this.counterService.timerDecrementing$.subscribe(
      val => this.timerDecrementing.set(val)
    );
    this.counterService.isWaitingForConfirmation$.subscribe(
      val => {
        this.isWaitingForConfirmation.set(val);
        if (val) {
          this.alarm.currentTime = 0;
          this.alarm.play();
        }
      }
    );
    this.counterService.currentCycleType$.subscribe(
      val => this.cycleState.set(val)
    );
    this.counterService.currentNumberOfCycles$.subscribe(
      val => this.numberOfCycles.set(val - 1)
    );
  }

  ngOnDestroy(): void {
    this.counterService.pomodoroRewind();
  }

  onStart(): void
  {
    if (this.timerStarted()) {
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
    this.alarm.pause();
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

  private getTitleName(): string
  {
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
}
