import { Component, effect, input, signal, computed } from '@angular/core';
import { StatusRequest, StatusResponse } from '../models/status';
import { StatusService } from '../services/status-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-line',
  imports: [CommonModule],
  templateUrl: './line.html',
  styleUrl: './line.scss',
})
export class Line {
  status = input.required<StatusRequest>();

  response = signal<StatusResponse>({status: -1});
  responseStatus = computed<'waiting'|'success'|'warning'|'error'>(
    () => {
      switch(this.response().status) {
        case -1: {
          return 'waiting';
        }
        case 0: {
            return 'success';
        }
        case 1: {
          return 'warning';
        }
        case 2: {
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
            this.response.set({status: 2});
          }
        },
      });
    });
  }
}
