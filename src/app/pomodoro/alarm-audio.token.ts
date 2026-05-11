import { InjectionToken } from '@angular/core';

export const ALARM_AUDIO = new InjectionToken<HTMLAudioElement>('alarm-audio', {
    factory: () => new Audio('assets/audio/alarm-clock.mp3'),
});
