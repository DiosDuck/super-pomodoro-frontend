import { Component, effect, input, signal, computed } from '@angular/core';
import { StatusService, StatusRequest, StatusResponse } from '../status.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-line',
  imports: [CommonModule],
  templateUrl: './line.html',
  styleUrl: './line.scss',
})
export class Line {
  status = input.required<StatusRequest>();

  response = signal<StatusResponse>({status: 'HOLD', message: 'Waiting...'});
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

  constructor(private statusService: StatusService) {
    effect(() => {
      const url = this.status().url;
      if (!url) {
        return;
      }

      this.statusService.getResponse(url).subscribe({
        next: (res) => {this.response.set(res)},
        error: (err) => {
          if ('status' in err.error) {
            this.response.set(err.error);
          } else {
            this.response.set({status: 'CRIT', message: 'Http Error'});
          }
        },
      });
    });
  }
}
