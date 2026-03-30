import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable, switchMap } from "rxjs";
import { LocalStorageService } from "../../shared/utils/local-storage.service";
import { UserService } from "../../auth/auth.service";
import { ToastService } from "../../shared/utils/toast.service";
import { HttpClient } from "@angular/common/http";

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

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject: BehaviorSubject<Settings>;
  settings$: Observable<Settings>;

  private readonly _settingsKey = 'pomodoro.settings';

  constructor(
    private _localStorageService: LocalStorageService,
    private _userService: UserService,
    private _toastService: ToastService,
    private _http: HttpClient,
  ) {
    this.settingsSubject = new BehaviorSubject<Settings>(this.getDefaultSettings());
    this.settings$ = this.settingsSubject.asObservable();
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
          this.settingsSubject.next(settings);
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
          this.settingsSubject.next(settings);
          this.setLocalStorageSettings(settings);
        }
      )
  }

  getSettings(): Settings
  {
    return this.settingsSubject.value;
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
    let setting = this.getDefaultSettings();
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

  private getDefaultSettings(): Settings
  {
    return {
      workTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      cyclesBeforeLongBreak: 4,
      maxConfirmationTime: 1,
      enableWaiting: true,
      type: this._settingsKey,
    };
  }
}
