import { ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { SessionChart } from "./session-chart";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { WorkTimeHistoryResponse } from "../profile.services";

describe('Session Chart Component', () => {
    let fixure: ComponentFixture<SessionChart>;
    let httpMock: HttpTestingController;
    let sessionChart: SessionChart;
    let workTimeHistoryResponseList: WorkTimeHistoryResponse[];
    let currentTimestamp: number;

    beforeAll(() => {
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        currentTimestamp = date.getTime();
        workTimeHistoryResponseList = [];
        while(workTimeHistoryResponseList.length < 7) {
            workTimeHistoryResponseList.unshift(
                {
                    workTimeTotal: 0,
                    sessionAmount: 0,
                    timestamp: date.getTime(),
                }
            );
            date.setDate(date.getDate() - 1);
        }
    })

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SessionChart],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ]
        });

        fixure = TestBed.createComponent(SessionChart);
        httpMock = TestBed.inject(HttpTestingController);
        sessionChart = fixure.componentInstance; 
    })

    afterEach(() => {
        httpMock.verify();
    })

    it('no sessions passed', () => {
        fixure.detectChanges();

        let req = httpMock.expectOne('/api/pomodoro/session/history?timestamp=' + currentTimestamp);
        req.flush(workTimeHistoryResponseList)

        fixure.detectChanges();

        expect(sessionChart.workSessionHistoryList()).toEqual(workTimeHistoryResponseList);
        expect(sessionChart.maxHeight()).toBe(0);
        expect(fixure.nativeElement.querySelector('.session-chart-not-found')).toBeTruthy();
    })

    it('session set', () => {
        let newWorkTimeHistoryResponseList = workTimeHistoryResponseList;

        newWorkTimeHistoryResponseList[0].workTimeTotal = 60*60*1;
        newWorkTimeHistoryResponseList[0].sessionAmount = 2;

        newWorkTimeHistoryResponseList[1].workTimeTotal = 60*60*2;
        newWorkTimeHistoryResponseList[1].sessionAmount = 4;
        
        fixure.detectChanges();

        let req = httpMock.expectOne('/api/pomodoro/session/history?timestamp=' + currentTimestamp);
        req.flush(newWorkTimeHistoryResponseList);

        fixure.detectChanges();

        expect(sessionChart.workSessionHistoryList()).toEqual(newWorkTimeHistoryResponseList);
        expect(sessionChart.maxHeight()).toBe(60*60*2);
        let columns: HTMLElement[] = fixure.nativeElement.querySelectorAll('.session-chart-table__column--block');

        expect(columns[0].style.height).toBe('6rem');
        expect(columns[1].style.height).toBe('12rem');
        expect(columns[3].style.height).toBe('0rem');
    })
});
