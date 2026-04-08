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

export const POMODORO_SETTINGS_KEY = 'pomodoro.settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject: BehaviorSubject<Settings>;
  settings$: Observable<Settings>;


  constructor(
    private localStorageService: LocalStorageService,
    private userService: UserService,
    private toastService: ToastService,
    private http: HttpClient,
  ) {
    this.settingsSubject = new BehaviorSubject<Settings>(this.getDefaultSettings());
    this.settings$ = this.settingsSubject.asObservable();
    this.loadSettings();
  }

  loadSettings(): void 
  {
    this.userService.waitFirstUser()
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

  updateSettings(settings: Settings): Observable<Settings> 
  {
    return this.userService.waitFirstUser()
      .pipe(
        switchMap(
          user => user === null ? this.updateLocalStorageSettings(settings) : this.updateUserSettings(settings) 
        )
      );
  }

  getSettings(): Settings
  {
    return this.settingsSubject.value;
  }

  private async loadUserSettings(): Promise<Settings>
  {
    try {
      let settingsHttp = await firstValueFrom(this.http.get<SettingsHttp>('/api/pomodoro/settings'));
      let settings = this.castToSettings(settingsHttp);
      return settings;
    } catch (err) {
      this.toastService.addToast('First settings created', 'note');
    }

    let settings = this.getLocalStorageSettings();
    let settingsHttp = this.castToHttpSettings(settings);
    try {
      await firstValueFrom(this.http.put('/api/pomodoro/settings', settingsHttp));
    } catch (err) {
      this.toastService.addToast('Error creating settings, please refresh the page', 'error', 10);
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
    this.setLocalStorageSettings(settings);
    this.settingsSubject.next(settings);
    return settings;
  }
  
  private async updateUserSettings(settings: Settings): Promise<Settings>
  {
    let settingsHttp = this.castToHttpSettings(settings);
    try {
      await firstValueFrom(this.http.post('/api/pomodoro/settings', settingsHttp));
      return await this.updateLocalStorageSettings(settings);
    } catch (err) {
      this.toastService.addToast('Error on saving the settings, please try again later on!', 'error', 10);
      throw err;
    }
  }

  private getLocalStorageSettings(): Settings
  {
    let data = this.localStorageService.getJsonParsed(POMODORO_SETTINGS_KEY);
    if (data !== null && 'type' in data && data.type === POMODORO_SETTINGS_KEY) {
      return data;
    }

    return this.getDefaultSettings();
  }

  private setLocalStorageSettings(settings: Settings): void
  {
    this.localStorageService.parseAndSet(
      POMODORO_SETTINGS_KEY, 
      settings
    );
  }

  private castToHttpSettings(settings: Settings): SettingsHttp
  {
    let {type, ...settingsHttp} = settings;
    return settingsHttp;
  }

  private castToSettings(settingsHttp: SettingsHttp): Settings
  {
    return {type: POMODORO_SETTINGS_KEY, ...settingsHttp};
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
      type: POMODORO_SETTINGS_KEY,
    };
  }
}
