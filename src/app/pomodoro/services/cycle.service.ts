import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LocalStorageService } from "../../shared/utils/local-storage.service";
import { Settings } from "./settings.service";

export type cycleType = 'idle' | 'work' | 'short-break' | 'long-break';

export interface Cycle {
    currentCycle: cycleType,
    currentNumberOfCycle: number,
    dateTime: Date,
    type: 'pomodoro.cycle',
}

export const POMODORO_CYCLE_KEY = 'pomodoro.cycle';

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private cycleSubject: BehaviorSubject<Cycle>;
  cycle$: Observable<Cycle>;

  constructor(
    private readonly _localStorageService: LocalStorageService,
  ) {
    this.cycleSubject = new BehaviorSubject(this._loadCycle());
    this.cycle$ = this.cycleSubject.asObservable();
    this.cycle$.subscribe((cycle) => this._setCycle(cycle));
  }

  reset(): void 
  {
    this.cycleSubject.next(this._createNewCycle());
  }

  nextCycle(settings : Settings): void 
  {
    let cycle = this.cycleSubject.value;
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

    this.cycleSubject.next(cycle);
  }

  start(): void 
  {
    let cycle = this.cycleSubject.value;
    if (cycle.currentCycle === 'idle') {
      cycle.currentCycle = 'work';
      this.cycleSubject.next(cycle);
    }
  }

  getCycleType(): cycleType
  {
    return this.cycleSubject.value.currentCycle;
  }

  static getDefaultCycle(): Cycle
  {
    return {
      currentCycle: 'idle',
      currentNumberOfCycle: 1,
      dateTime: new Date(),
      type: POMODORO_CYCLE_KEY,
    };
  }

  private _loadCycle(): Cycle
  {
    let data = this._localStorageService.getJsonParsed(POMODORO_CYCLE_KEY);
    if (data !== null && 'type' in data && data.type === POMODORO_CYCLE_KEY) {
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
    let cycle = CycleService.getDefaultCycle();
    this._setCycle(cycle);
    return cycle;
  }

  private _isValidCycle(cycle: Cycle): boolean
  {
    let date = new Date();
    return date.getDate() === cycle.dateTime.getDate();
  }

  private _setCycle(cycle: Cycle): void
  {
    this._localStorageService.parseAndSet(
      POMODORO_CYCLE_KEY,
      cycle
    );
  }
}
