import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { navId } from '../navbar.model';
import { Observable, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-nav-bubble',
  imports: [],
  templateUrl: './bubble.html',
  styleUrl: './bubble.scss',
})
export class Bubble implements OnInit{
  id = input.required<navId>();
  selectedId = input.required<Observable<navId>>();
  icon = input.required<string>();

  private destroyRef = inject(DestroyRef);
  pastId: navId = null;
  isDisplayed = signal<boolean>(false);
  isActivating = signal<boolean>(false);
  isSelected = signal<boolean>(false);
  currentIcon = computed<string>(() => this.isActivating() ? 'close' : this.icon())

  onSelect = output<navId>();

  ngOnInit(): void {
    this.selectedId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id: navId) => {
        if (this.id() === id) {
          this.isDisplayed.set(true);
          this.isActivating.set(true);
          timer(100).subscribe(() => this.isSelected.set(true));
        }
        
        if (this.id() === this.pastId) {
          this.isSelected.set(false);
          timer(100).subscribe(() => this.isActivating.set(false));
          timer(200).subscribe(() => this.isDisplayed.set(false));
        }

        this.pastId = id;
      }
    )
  }

  toggle() {
    if (this.pastId === this.id()) {
      this.onSelect.emit(null);
    } else {
      this.onSelect.emit(this.id());
    }
  }
}
