export interface SettingsHttp {
    workTime: number,
    shortBreakTime: number,
    longBreakTime: number,
    cyclesBeforeLongBreak: number,
    maxConfirmationTime: number,
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
