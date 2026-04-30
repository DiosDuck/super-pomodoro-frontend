import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
    StatusService,
    StatusRequest,
    StatusResponse,
} from '../status.service';
import { CommonModule } from '@angular/common';
import { catchError, of, take } from 'rxjs';

@Component({
    selector: 'app-status-line',
    imports: [CommonModule],
    templateUrl: './line.html',
    styleUrl: './line.scss',
})
export class Line implements OnInit {
    private statusService = inject(StatusService);

    status = input.required<StatusRequest>();

    response = signal<StatusResponse>({ status: 'HOLD', message: 'Waiting...' });

    responseStatus = computed<'waiting' | 'success' | 'warning' | 'error'>(
        () => {
            switch (this.response().status) {
                case 'HOLD': {
                    return 'waiting';
                }
                case 'OK': {
                    return 'success';
                }
                case 'WARN': {
                    return 'warning';
                }
                case 'CRIT': {
                    return 'error';
                }
            }
        },
    );

    ngOnInit(): void {
        this.statusService.getResponse(this.status().url)
        .pipe(
            take(1),
            catchError(err => 
                of('status' in err.error 
                    ? (err.error as StatusResponse)
                    : ({ status: 'CRIT', message: 'Http Error' } as StatusResponse)
                )
            ),
        )
        .subscribe(
            statusResponse => this.response.set(statusResponse)
        )
    }
}
