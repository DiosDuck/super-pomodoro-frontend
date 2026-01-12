import { Component, inject, OnInit, signal } from "@angular/core";
import { ChartRow, TEST_CHART_ROW_LIST, WorkTimeHistoryResponse } from "../profile.models";
import { DatePipe } from "@angular/common";
import { WorkSessionHistoryService } from "../profile.services";
import { take } from "rxjs";

@Component({
    selector: 'app-profile-session-chart',
    templateUrl: 'session-chart.html',
    styleUrl: 'session-chart.scss',
    imports: [DatePipe],
})
export class SessionChart implements OnInit {
    chartListResponse = TEST_CHART_ROW_LIST;
    workSessionHistoryList = signal<WorkTimeHistoryResponse[]>([]);
    workSessionHistoryService = inject(WorkSessionHistoryService);
    chartList : ChartRow[] = [];
    maxHeight = signal<number>(0);

    ngOnInit(): void {
        this.formatChartResponse();
        this.workSessionHistoryService.getHistory()
            .pipe(take(1))
            .subscribe((value) => {
                    this.workSessionHistoryList.set(value);
                    this.maxHeight.set(this.getMaxFromList());
                }
            )
    }

    private getMaxFromList(): number
    {
        let max = 0;
        for (let value of this.workSessionHistoryList()) {
            if (value.workTimeTotal > max) {
                max = value.workTimeTotal;
            }
        }

        return max;
    }

    private formatChartResponse() : void
    {
        this.chartList = this.chartListResponse.map<ChartRow>(value => {
            return {
                heigth: value.heigth / 60,
                text: value.text,
                date: new Date(value.timestamp),
            }
        });
    }
}