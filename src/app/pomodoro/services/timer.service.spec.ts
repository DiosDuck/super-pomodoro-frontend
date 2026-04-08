import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { Timer, TimerFactory } from "./timer.service";

describe('Timer Testing', () => {
    it('TimerFactory creates a new Timer', () => {
        let timerFactory = TestBed.inject(TimerFactory);
        let timer = timerFactory.getNewTimer();

        expect(timer).toBeInstanceOf(Timer);
    });

    it('Timer', () => {
        vi.useFakeTimers();

        let timer = new Timer();
        let latestValue: number | undefined;
        const timerStatusChanged = vi.fn();
        const finished = vi.fn();

        timer.remainingSeconds$.subscribe(
            value => latestValue = value
        );
        timer.timerStatusChanged$.subscribe(
            () => timerStatusChanged()
        );
        timer.finish$.subscribe(
            () => finished()
        );

        timer.setTime(1500);
        expect(latestValue).toBe(1500);
        expect(timerStatusChanged).toHaveBeenCalledTimes(0);
        expect(finished).toHaveBeenCalledTimes(0);
        expect(timer.isTimerStarted).toBe(false);
        expect(timer.isTimerDecrementing).toBe(false);

        timer.start();
        vi.advanceTimersByTime(1000);
        expect(latestValue).toBe(1499);
        expect(timerStatusChanged).toHaveBeenCalledTimes(1);
        expect(timer.isTimerStarted).toBe(true);
        expect(timer.isTimerDecrementing).toBe(true);
        expect(finished).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(99000);
        expect(latestValue).toBe(1400);
        expect(timerStatusChanged).toHaveBeenCalledTimes(1);
        expect(finished).toHaveBeenCalledTimes(0);

        timer.stop();
        vi.advanceTimersByTime(10000);
        expect(latestValue).toBe(1400);
        expect(timerStatusChanged).toHaveBeenCalledTimes(2);
        expect(timer.isTimerStarted).toBe(true);
        expect(timer.isTimerDecrementing).toBe(false);
        expect(finished).toHaveBeenCalledTimes(0);

        timer.continue();
        vi.advanceTimersByTime(100000);
        expect(latestValue).toBe(1300);
        expect(timerStatusChanged).toHaveBeenCalledTimes(3);
        expect(timer.isTimerStarted).toBe(true);
        expect(timer.isTimerDecrementing).toBe(true);
        expect(finished).toHaveBeenCalledTimes(0);

        timer.addTime(120);
        expect(latestValue).toBe(1420);
        expect(timerStatusChanged).toHaveBeenCalledTimes(3);
        expect(finished).toHaveBeenCalledTimes(0);

        timer.reset();
        vi.advanceTimersByTime(100000);
        expect(latestValue).toBe(1420);
        expect(timerStatusChanged).toHaveBeenCalledTimes(4);
        expect(timer.isTimerStarted).toBe(false);
        expect(timer.isTimerDecrementing).toBe(false);
        expect(finished).toHaveBeenCalledTimes(0);


        timer.start();
        expect(latestValue).toBe(1420);
        expect(timerStatusChanged).toHaveBeenCalledTimes(5);
        expect(timer.isTimerStarted).toBe(true);
        expect(timer.isTimerDecrementing).toBe(true);
        expect(finished).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(1420000);
        expect(latestValue).toBe(0);
        expect(timerStatusChanged).toHaveBeenCalledTimes(6);
        expect(timer.isTimerStarted).toBe(false);
        expect(timer.isTimerDecrementing).toBe(false);
        expect(finished).toHaveBeenCalledTimes(1);
    });
});
