import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { CounterService } from '../../pomodoro.services';
import { RouterLink } from "@angular/router";
import { Title } from '@angular/platform-browser';
import { cycleType } from '../../pomodoro.model';

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
      if (this.isWaitingFormConfirmation()) {
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
  timerStarted = signal<boolean>(false);
  sessionStarted = signal<boolean>(false);
  isWaitingFormConfirmation = this.counterService.waitingConfirmation;
  alarm = viewChild.required<ElementRef<HTMLAudioElement>>('audio');

  titleValue = computed(
    () => {
      let start: string;
      if (this.isWaitingFormConfirmation()) {
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
    this.counterService.cycle.subscribe((cycle) => {
      this.cycleState.set(cycle.currentCycle);
      this.numberOfCycles.set(cycle.currentNumberOfCycle - 1);
    })
    this.counterService.remainingSeconds.subscribe((time: number) => {
      this.timer.set(time);
      this.title.setTitle(this.titleValue());
    });
    this.counterService.finish.subscribe(() => {
      if (this.isWaitingFormConfirmation()) {
        this.timerStarted.set(false);
        this.sessionStarted.set(false);
      } else {
        this.alarm().nativeElement.currentTime = 0;
        this.alarm().nativeElement.play();
      }
    })
  }

  ngOnDestroy(): void {
    this.counterService.pomodoroRewind();
  }

  async onStart(): Promise<void>
  {
    if (this.sessionStarted()) {
      await this.counterService.pomodoroContinue()
    } else {
      this.sessionStarted.set(true);
      await this.counterService.pomodoroStart()
    }
    this.timerStarted.set(true);
  }

  onStop(): void
  {
    this.timerStarted.set(false);
    this.counterService.pomodoroStop();
  }

  async onNext(): Promise<void>
  {
    this.timerStarted.set(false);
    this.sessionStarted.set(false);
    this.alarm().nativeElement.pause();
    await this.counterService.pomodoroNext();
  }

  async onIncrement(count: number): Promise<void>
  {
    await this.counterService.pomodoroIncrement(count);
  }

  async onRewind(): Promise<void>
  {
    this.sessionStarted.set(false);
    this.timerStarted.set(false);
    await this.counterService.pomodoroRewind();
  }

  async onReset(): Promise<void>
  {
    this.sessionStarted.set(false);
    this.timerStarted.set(false);
    await this.counterService.pomodoroReset();
  }
}
