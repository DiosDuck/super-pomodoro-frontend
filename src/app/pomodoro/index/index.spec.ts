import { ComponentFixture } from "@angular/core/testing";
import { beforeEach, describe, vi } from "vitest";
import { Index as PomodoroIndex } from ".";
import { BehaviorSubject } from "rxjs";
import { Cycle, CycleService } from "../services/cycle.service";
import { SettingsService, Settings } from "../services/settings.service";
import { Title } from "@angular/platform-browser";

describe('Pomodor Index', () => {
    const cycleSubject = new BehaviorSubject<Cycle>(CycleService.getDefaultCycle());
    let cycleServiceMock = {
        start: vi.fn(),
        reset: vi.fn(),
        nextCycle: vi.fn(),
        cycle$: cycleSubject.asObservable(),
    };
    const settingsSubject = new BehaviorSubject<Settings>(SettingsService.getDefaultSettings());
    let settingsServiceMock = {
        settings$: settingsSubject.asObservable(),
    };
    const workSessionServiceMock = {
        saveNewWorkSession: vi.fn(),
    };

    let fixure: ComponentFixture<PomodoroIndex>;
    let title: Title;
    
    beforeEach(() => {
        cycleSubject.next(CycleService.getDefaultCycle());
        settingsSubject.next(SettingsService.getDefaultSettings());
    })
});
