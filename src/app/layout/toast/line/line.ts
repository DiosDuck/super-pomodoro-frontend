import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from "@angular/core";
import { Toast } from "../../../shared/utils/toast.service";
import { Subject, takeUntil, timer } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-toast-line',
  templateUrl: './line.html',
  styleUrl: './line.scss',
})
export class Line implements OnInit{
    private destroyRef = inject(DestroyRef);
    isClosed = signal<boolean>(false);
    private finish = new Subject<void>();
    private observableFinish = this.finish.asObservable();

    toast = input.required<Toast>();
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
      timer(this.toast().time * 1000)
        .pipe(
          takeUntil(this.observableFinish),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.finish.next();
        });

      this.observableFinish
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.isClosed.set(true);
          timer(1000)
            .subscribe(() => this.close.emit(this.toast().id));
        });
    }

    onClose(): void
    {
      this.finish.next();
    }
}

