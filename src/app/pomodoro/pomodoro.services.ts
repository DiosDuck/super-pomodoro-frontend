import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../shared/services/local-storage';
import { Cycle, cycleType, Settings, SettingsHttp } from './pomodoro.model';
import { BehaviorSubject, firstValueFrom, interval, Observable, ReplaySubject, Subject, switchMap, take, takeUntil, takeWhile } from 'rxjs';
import { UserService } from '../shared/services/user';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../shared/services/toast';

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
    this._userService.user
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
    this._userService.user
      .pipe(
        take(1),
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
      this._toastService.addToast('Error creating settings, please refresh the page', 'error');
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
      this._toastService.addToast('Error on saving the settings, please try again!', 'error');
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
    private readonly _workSessionHttpService: WorkSessionHttpService,
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
      this._workSessionHttpService.saveNewToastService(settings.workTime);
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

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  public cycle: Observable<Cycle>;
  private _waitingConfirmation: WritableSignal<boolean>;
  public waitingConfirmation: Signal<boolean>;

  private _stop: Subject<void>;
  private _remainingSeconds: BehaviorSubject<number>;
  private _finish: Subject<void>;
  
  public remainingSeconds: Observable<number>;
  public finish: Observable<void>;

  constructor(
    private _cycleService: CycleService,
    private _settingService: SettingsService,
  ) {
    this.cycle = this._cycleService.cycle;
    this._waitingConfirmation = signal(false);
    this.waitingConfirmation = this._waitingConfirmation.asReadonly();

    this._stop = new Subject<void>();
    this._remainingSeconds = new BehaviorSubject<number>(0);
    this.remainingSeconds = this._remainingSeconds.asObservable();
    this._finish = new Subject<void>();
    this.finish = this._finish.asObservable();

    this._settingService.settings
      .subscribe(
        settings => this._remainingSeconds.next(this._getSeconds(settings))
      )
    ;
  }

  async pomodoroStart() : Promise<void> 
  {
    this._cycleService.start();
    let setting = await this._settingService.getSettings();
    this._start(this._getSeconds(setting));
  }

  async pomodoroContinue() : Promise<void>
  {
    this._start(this._remainingSeconds.value);
  }

  async pomodoroIncrement(count: number) : Promise<void>
  {
    this._start(this._remainingSeconds.value + count * 60);
  }

  async pomodoroRewind() : Promise<void>
  {
    this.pomodoroStop();
    let setting = await this._settingService.getSettings();
    this._remainingSeconds.next(this._getSeconds(setting));
  }

  async pomodoroReset() : Promise<void>
  {
    this.pomodoroStop();
    let setting = await this._settingService.getSettings();
    this._cycleService.reset();
    this._remainingSeconds.next(this._getSeconds(setting));
    this._waitingConfirmation.set(false);
  }

  async waitingConfirmationStart() : Promise<void>
  {
    let settings = await this._settingService.getSettings();
    this._start(settings.maxConfirmationTime * 60);
  }

  pomodoroStop(): void
  {
    this._stop.next();
  }

  async pomodoroNext() : Promise<void>
  {
    this.pomodoroStop();
    let settings = await this._settingService.getSettings();
    
    this._cycleService.next(settings);

    this._waitingConfirmation.set(false);
    this._remainingSeconds.next(this._getSeconds(settings));
  }

  private _getSeconds(settings: Settings): number
  {
    let time: number;

    switch (this._cycleService.getCycleType()) {
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

    return time * 60;
  }

  private _start(numberSeconds : number) : void
  {
    this.pomodoroStop();

    this._remainingSeconds.next(numberSeconds);
    interval(1000)
      .pipe(
        takeUntil(this._stop),
        takeWhile(() => this._remainingSeconds.value > 0)
      )
      .subscribe(() => {
        const next = this._remainingSeconds.value - 1;
        this._remainingSeconds.next(next);

        if (next === 0) {
          this._finish.next();
          this._confirmationWaiting();
        }
      })
    ;
  }

  private async _confirmationWaiting() : Promise<void>
  {
    this.pomodoroStop();
    let settings = await this._settingService.getSettings();

    this._remainingSeconds.next(settings.maxConfirmationTime * 60);
    this._waitingConfirmation.set(true);
    
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
          this.pomodoroReset();
        }
      });
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