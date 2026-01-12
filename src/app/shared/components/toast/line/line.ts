import { Component, computed, input, OnInit, output, signal } from "@angular/core";
import { Toast } from "../../../models/toast";
import { BehaviorSubject, delay, interval, Subject, takeUntil, takeWhile, timer } from "rxjs";

@Component({
  selector: 'app-toast-line',
  templateUrl: './line.html',
  styleUrl: './line.scss',
})
export class Line implements OnInit{
    isClosed = signal<boolean>(false);
    private _finish = new Subject<void>();
    private _observableFinish = this._finish.asObservable();

    toast = input.required<Toast>();
    timeUp = input<number>(5);
    close = output<number>();
    icon = computed(() => {
      switch (this.toast().status) {
        case 'error':
          return 'error';
        case 'note':
          return 'info';
        case 'success':
          return 'check';
      }
    });

    ngOnInit(): void {
      timer(this.timeUp() * 1000)
        .pipe(
          takeUntil(this._observableFinish)
        )
        .subscribe(() => {
          this._finish.next();
        })
      ;

      this._observableFinish.subscribe(() => {
        this.isClosed.set(true);
        timer(1000)
          .subscribe(() => this.close.emit(this.toast().id))
      })
    }

    onClose(): void
    {
      this._finish.next();
    }
}
