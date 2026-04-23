import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Timer } from './timer.service';

describe('Timer Testing', () => {
    let timer: Timer;
    let latestValue: number | undefined;
    let finishedTimer: Mock;
    let confirmationStarted: Mock;
    let latestConfirmationValue: number | undefined;
    let finishedConfirmationTImer: Mock;

    beforeEach(() => {
        timer = TestBed.inject(Timer);
        vi.useFakeTimers();
        finishedTimer = vi.fn();
        confirmationStarted = vi.fn();
        finishedConfirmationTImer = vi.fn();
        latestValue = undefined;
        latestConfirmationValue = undefined;

        timer.remainingTime$.subscribe((value) => (latestValue = value));
        timer.confirmationTimeStarted$.subscribe(() => confirmationStarted());
        timer.finishTime$.subscribe((value) => finishedTimer(value));
        timer.remainingConfirmationTime$.subscribe(
            (value) => (latestConfirmationValue = value),
        );
        timer.finishConfirmationTime$.subscribe(() =>
            finishedConfirmationTImer(),
        );
    });

    it('Timer without confirmation', () => {
        timer.setTime(1500);
        timer.setConfirmationTime(0);
        expect(latestValue).toBe(1500);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        timer.startTimer();
        vi.advanceTimersByTime(1000);
        expect(latestValue).toBe(1499);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(99000);
        expect(latestValue).toBe(1400);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        timer.stopTimer();
        vi.advanceTimersByTime(10000);
        expect(latestValue).toBe(1400);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        timer.continueTimer();
        vi.advanceTimersByTime(100000);
        expect(latestValue).toBe(1300);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        timer.addTime(120);
        expect(latestValue).toBe(1420);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        timer.resetTimer();
        vi.advanceTimersByTime(100000);
        expect(latestValue).toBe(1500);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        timer.startTimer();
        expect(latestValue).toBe(1500);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(1500000);
        expect(latestValue).toBe(0);
        expect(finishedTimer).toHaveBeenCalledTimes(1);
        expect(confirmationStarted).toHaveBeenCalledTimes(0);
    });

    it('Timer with confirmation success', () => {
        timer.setTime(1500);
        timer.setConfirmationTime(30);
        expect(latestValue).toBe(1500);

        timer.startTimer();
        vi.advanceTimersByTime(1500000);
        expect(latestValue).toBe(0);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(1);
        expect(latestConfirmationValue).toBe(30);

        vi.advanceTimersByTime(5000);
        expect(latestConfirmationValue).toBe(25);

        timer.confirmTimer();
        vi.advanceTimersByTime(5000);
        expect(latestConfirmationValue).toBe(25);
        expect(finishedTimer).toHaveBeenCalledTimes(1);
        expect(finishedConfirmationTImer).toHaveBeenCalledTimes(0);
    });

    it('Timer with confirmation failed', () => {
        timer.setTime(1500);
        timer.setConfirmationTime(30);
        expect(latestValue).toBe(1500);

        timer.startTimer();
        vi.advanceTimersByTime(1500000);
        expect(latestValue).toBe(0);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(confirmationStarted).toHaveBeenCalledTimes(1);
        expect(latestConfirmationValue).toBe(30);

        vi.advanceTimersByTime(5000);
        expect(latestConfirmationValue).toBe(25);

        vi.advanceTimersByTime(25000);
        expect(latestConfirmationValue).toBe(0);
        expect(finishedTimer).toHaveBeenCalledTimes(0);
        expect(finishedConfirmationTImer).toHaveBeenCalledTimes(1);
    });
});
