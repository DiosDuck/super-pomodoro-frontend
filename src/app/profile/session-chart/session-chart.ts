import { Component, inject, OnInit, signal } from "@angular/core";
import { WorkTimeHistoryResponse } from "../profile.models";
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
    workSessionHistoryList = signal<WorkTimeHistoryResponse[]>([]);
    workSessionHistoryService = inject(WorkSessionHistoryService);
    maxHeight = signal<number>(0);

    ngOnInit(): void {
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
}