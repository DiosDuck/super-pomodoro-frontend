import { Injectable } from "@angular/core";
import { UserService } from "../../auth/auth.service";
import { ToastService } from "../../shared/utils/toast.service";
import { HttpClient } from "@angular/common/http";
import { take } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WorkSessionService {
  private isLoggedIn = false;

  constructor(
    private readonly userService : UserService,
    private readonly toastService : ToastService,
    private readonly http : HttpClient,
  ) {
    this.userService.user$.subscribe(
      (user) => {
        this.isLoggedIn = user !== null;
      }
    );
  }

  saveNewToastService(workTime : number) {
    if (this.isLoggedIn) {
      this.http.put(
          '/api/pomodoro/session',
          {
            workTime: workTime,
          }
        )
        .pipe(
          take(1),
        )
        .subscribe({
          next: () => this.toastService.addToast('Saved to your profile', 'note'),
          error: () => this.toastService.addToast('There has been an error saving', 'error'),
        })
      ;
    }
  }
}
