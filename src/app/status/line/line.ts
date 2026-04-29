import { Component, computed, inject, input } from '@angular/core';
import { StatusService, StatusRequest, StatusResponse } from '../status.service';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, filter, catchError, of } from 'rxjs';

@Component({
  selector: 'app-status-line',
  imports: [CommonModule],
  templateUrl: './line.html',
  styleUrl: './line.scss',
})
export class Line {
  private statusService = inject(StatusService);

  status = input.required<StatusRequest>();

  response = toSignal(
    toObservable(this.status).pipe(
      map(s => s.url),
      filter(url => !!url),
      switchMap(url =>
        this.statusService.getResponse(url).pipe(
          catchError(err => of(
            'status' in err.error
              ? err.error as StatusResponse
              : { status: 'CRIT', message: 'Http Error' } as StatusResponse
          ))
        )
      ),
    ),
    { initialValue: { status: 'HOLD', message: 'Waiting...' } as StatusResponse },
  );

  responseStatus = computed<'waiting'|'success'|'warning'|'error'>(
    () => {
      switch(this.response().status) {
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
    }
  );
}

