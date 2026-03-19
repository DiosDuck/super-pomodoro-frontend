import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../shared/utils/local-storage.service';
import { BehaviorSubject, firstValueFrom, interval, Observable, ReplaySubject, Subject, switchMap, take, takeUntil, takeWhile } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../shared/utils/toast.service';
import { UserService } from '../auth/auth.service';

export interface SettingsHttp {
    workTime: number,
    shortBreakTime: number,
    longBreakTime: number,
    cyclesBeforeLongBreak: number,
    maxConfirmationTime: number,
    enableWaiting: boolean,
}

export interface Settings extends SettingsHttp {
    type: 'pomodoro.settings',
}

export type cycleType = 'idle' | 'work' | 'short-break' | 'long-break';

export interface Cycle {
    currentCycle: cycleType,
    currentNumberOfCycle: number,
    dateTime: Date,
    type: 'pomodoro.cycle',
}


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings = new ReplaySubject<Settings>(1);
  settings = this._settings.asObservable();

  private readonly _settingsKey = 'pomodoro.settings';

  constructor(
    private _localStorageService: LocalStorageService,
    private _userService: UserService,
    private _toastService: ToastService,
    private _http: HttpClient,
  ) {
    this.loadSettings();
  }

  loadSettings(): void 
  {
    this._userService.waitFirstUser()
      .pipe(
        switchMap(
          user => user === null ? this.loadLocalStorageSettings() : this.loadUserSettings()
        )
      )
      .subscribe(
        settings => {
          this._settings.next(settings);
          this.setLocalStorageSettings(settings);
        }
      );
  }

  updateSettings(settings: Settings): void 
  {
    this._userService.waitFirstUser()
      .pipe(
        switchMap(
          user => user === null ? this.updateLocalStorageSettings(settings) : this.updateUserSettings(settings) 
        )
      )
      .subscribe(
        settings => {
          this._settings.next(settings);
          this.setLocalStorageSettings(settings);
        }
      )
  }

  async getSettings(): Promise<Settings>
  {
    return await firstValueFrom(this.settings);
  }

  private async loadUserSettings(): Promise<Settings>
  {
    try {
      let settingsHttp = await firstValueFrom(this._http.get<SettingsHttp>('/api/pomodoro/settings'));
      let settings = this.castToSettings(settingsHttp);
      return settings;
    } catch (err) {
      this._toastService.addToast('First settings created', 'note');
    }

    let settings = this.getLocalStorageSettings();
    let settingsHttp = this.castToHttpSettings(settings);
    try {
      await firstValueFrom(this._http.put('/api/pomodoro/settings', settingsHttp));
    } catch (err) {
      this._toastService.addToast('Error creating settings, please refresh the page', 'error', 10);
    }

    return settings;
  }

  private async loadLocalStorageSettings(): Promise<Settings>
  {
    let settings = this.getLocalStorageSettings();
    return settings;
  }

  private async updateLocalStorageSettings(settings: Settings): Promise<Settings>
  {
    return settings;
  }
  
  private async updateUserSettings(settings: Settings): Promise<Settings>
  {
    let settingsHttp = this.castToHttpSettings(settings);
    try {
      await firstValueFrom(this._http.post('/api/pomodoro/settings', settingsHttp));
    } catch (err) {
      this._toastService.addToast('Error on saving the settings, please try again!', 'error', 10);
    }

    return settings;
  }

  private getLocalStorageSettings(): Settings
  {
    let data = this._localStorageService.getJsonParsed(this._settingsKey);
    if (data !== null && 'type' in data && data.type === this._settingsKey) {
      return data;
    }

    return this.createNewSetting();
  }

  private setLocalStorageSettings(settings: Settings): void
  {
    this._localStorageService.parseAndSet(
      this._settingsKey, 
      settings
    );
  }

  private createNewSetting(): Settings
  {
    let setting: Settings = {
      workTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      cyclesBeforeLongBreak: 4,
      maxConfirmationTime: 1,
      enableWaiting: true,
      type: this._settingsKey,
    };
    this.setLocalStorageSettings(setting);
    return setting;
  }

  private castToHttpSettings(settings: Settings): SettingsHttp
  {
    let {type, ...settingsHttp} = settings;
    return settingsHttp;
  }

  private castToSettings(settingsHttp: SettingsHttp): Settings
  {
    return {type: this._settingsKey, ...settingsHttp};
  }
}

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private _cycle: BehaviorSubject<Cycle>;
  cycle: Observable<Cycle>;

  private readonly _cycleKey = 'pomodoro.cycle';

  constructor(
    private readonly _localStorageService: LocalStorageService,
  ) {
    this._cycle = new BehaviorSubject(this._loadCycle());
    this.cycle = this._cycle.asObservable();
    this.cycle.subscribe((cycle) => this._setCycle(cycle));
  }

  reset(): void 
  {
    this._cycle.next(this._createNewCycle());
  }

  next(settings : Settings): void 
  {
    let cycle = this._cycle.value;
    if (cycle.currentCycle !== 'work') {
      cycle.currentCycle = 'work';
    } else {
      if (cycle.currentNumberOfCycle % settings.cyclesBeforeLongBreak === 0) {
        cycle.currentCycle = 'long-break';
      } else {
        cycle.currentCycle = 'short-break';
      }

      cycle.currentNumberOfCycle += 1;
    }

    this._cycle.next(cycle);
  }

  start(): void 
  {
    let cycle = this._cycle.value;
    if (cycle.currentCycle === 'idle') {
      cycle.currentCycle = 'work';
      this._cycle.next(cycle);
    }
  }

  getCycleType(): cycleType
  {
    return this._cycle.value.currentCycle;
  }

  private _loadCycle(): Cycle
  {
    let data = this._localStorageService.getJsonParsed(this._cycleKey);
    if (data !== null && 'type' in data && data.type === this._cycleKey) {
      let convertedData: Cycle = {
        ...data,
        dateTime: new Date(data.dateTime),
      };
      
      if (this._isValidCycle(convertedData)) {
        return convertedData;
      }
    }

    return this._createNewCycle();
  }

  private _createNewCycle(): Cycle
  {
    let cycle: Cycle = {
      currentCycle: 'idle',
      currentNumberOfCycle: 1,
      dateTime: new Date(),
      type: this._cycleKey,
    };
    this._setCycle(cycle);
    return cycle;
  }

  private _isValidCycle(cycle: Cycle): boolean
  {
    let date = new Date();
    return date.getDate() === cycle.dateTime.getDate();
  }

  public _setCycle(cycle: Cycle): void
  {
    this._localStorageService.parseAndSet(
      this._cycleKey,
      cycle
    );
  }
}

export class Timer {
  private _stop: Subject<void>;
  private _remainingSeconds: BehaviorSubject<number>;
  private _finish: Subject<void>;

  public remainingSeconds: Observable<number>;
  public finish: Observable<void>;

  private _timerStarted: WritableSignal<boolean>;
  private _timerDecrementing: WritableSignal<boolean>;

  public timerStarted: Signal<boolean>;
  public timerDecrementing: Signal<boolean>;

  constructor() {
    this._stop = new Subject<void>();
    this._remainingSeconds = new BehaviorSubject<number>(0);
    this.remainingSeconds = this._remainingSeconds.asObservable();
    this._finish = new Subject<void>();
    this.finish = this._finish.asObservable();

    this._timerStarted = signal(false);
    this.timerStarted = this._timerStarted.asReadonly();
    this._timerDecrementing = signal(false);
    this.timerDecrementing = this._timerDecrementing.asReadonly();
  }

  setTime(time : number): void
  {
    this.stop();

    this._remainingSeconds.next(time);
  }

  start(): void 
  {
    this.stop();

    this._timerStarted.set(true);
    this._timerDecrementing.set(true);
    this._intervalStarted();
  }

  continue(): void
  {
    this.stop();

    this._timerDecrementing.set(true);
    this._intervalStarted();
  }

  reset(): void
  {
    this.stop();
    this._timerStarted.set(false);
  }

  addTime(seconds : number): void
  {
    let time = this._remainingSeconds.getValue();
    time += seconds;
    this._remainingSeconds.next(time);
  }

  stop(): void
  {
    this._timerDecrementing.set(false);
    this._stop.next();
  }

  private _intervalStarted(): void
  {
    interval(1000)
      .pipe(
        takeUntil(this._stop),
        takeWhile(() => this._remainingSeconds.value > 0),
      )
      .subscribe(() => {
        const next = this._remainingSeconds.value - 1;
        this._remainingSeconds.next(next);

        if (next === 0) {
          this._finish.next();
        }
      });
  }
}

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  public cycle: Observable<Cycle>;
  public sessionTimer: Timer;
  public waitingTimer: Timer;
  private _settings: Settings | null;
  private _time: number;

  constructor(
    private _cycleService: CycleService,
    private readonly _workSessionHttpService: WorkSessionHttpService,
    _settingService: SettingsService,
  ) {
    this.cycle = this._cycleService.cycle;
    this.sessionTimer = new Timer();
    this.waitingTimer = new Timer();
    this._settings = null;
    this._time = 0;
    _settingService.settings
      .subscribe(
        settings => {
          this._settings = settings;
          this._time = this._getSeconds();
          this.sessionTimer.setTime(this._time);
        }
      );
  }

  pomodoroStart(): void
  {
    this._cycleService.start();
    this._time = this._getSeconds();

    this.sessionTimer.setTime(this._time);
    this.sessionTimer.start();
    this.sessionTimer.finish.subscribe(
      () => {
        this._finishSession();
      }
    )
  }

  pomodoroContinue(): void
  {
    this.sessionTimer.continue();
  }

  pomodoroIncrement(seconds: number): void
  {
    this._time += seconds;
    this.sessionTimer.addTime(seconds);
  }

  pomodoroRewind(): void
  {
    this._time = this._getSeconds();
    this.sessionTimer.reset();
    this.sessionTimer.setTime(this._time);
  }

  pomodoroReset(): void
  {
    this.sessionTimer.reset();
    this.waitingTimer.reset();
    this._cycleService.reset();
    this._time = this._getSeconds();
    this.sessionTimer.setTime(this._time);
  }

  pomodoroStop(): void
  {
    this.sessionTimer.stop();
  }

  pomodoroNext(): void
  {
    this.waitingTimer.reset(); 
    this.sessionTimer.reset();
    this._nextStep();
  }

  private _getSeconds(): number
  {
    let time: number;

    switch (this._cycleService.getCycleType()) {
      case 'idle':
      case 'work':
        time = this._settings!.workTime;
        break;
      case 'short-break':
        time = this._settings!.shortBreakTime;
        break;
      case 'long-break':
        time = this._settings!.longBreakTime;
        break;
    }

    return time * 60;
  }

  private _finishSession(): void
  {
    this.sessionTimer.reset();

    if (this._settings!.enableWaiting) {
      this._confirmationWaiting();
    } else {
      this._nextStep();
    }
  }

  private _confirmationWaiting(): void
  {
    this.waitingTimer.setTime(this._settings!.maxConfirmationTime * 60);
    this.waitingTimer.start();
  }

  private _nextStep(): void
  {
    if (this._cycleService.getCycleType() === 'work') {
      this._workSessionHttpService.saveNewToastService(this._time / 60);
    }

    this._cycleService.next(this._settings!);
    this.sessionTimer.setTime(this._getSeconds());
  }
}

@Injectable({
  providedIn: 'root'
})
export class WorkSessionHttpService {
  private _isLoggedIn : boolean;

  constructor(
    private readonly _userService : UserService,
    private readonly _toastService : ToastService,
    private readonly _http : HttpClient,
  ) {
    this._isLoggedIn = false;
    this._userService.user.subscribe(
      (user) => this._isLoggedIn = (user !== null)
    );
  }

  saveNewToastService(workTime : number) {
    if (this._isLoggedIn) {
      this._http.put(
          '/api/pomodoro/session',
          {
            workTime: workTime,
          }
        )
        .pipe(
          take(1),
        )
        .subscribe({
          next: () => this._toastService.addToast('Saved to your profile', 'note'),
          error: () => this._toastService.addToast('There has been an error saving', 'error'),
        })
      ;
    }
  }
}
