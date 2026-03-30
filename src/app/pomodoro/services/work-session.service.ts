import { Injectable } from "@angular/core";
import { UserService } from "../../auth/auth.service";
import { ToastService } from "../../shared/utils/toast.service";
import { HttpClient } from "@angular/common/http";
import { take } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WorkSessionService {
  private _isLoggedIn = false;

  constructor(
    private readonly _userService : UserService,
    private readonly _toastService : ToastService,
    private readonly _http : HttpClient,
  ) {
    this._userService.user.subscribe(
      (user) => this._isLoggedIn = (user !== null)
    );
  }

  saveNewToastService(workTime : number) {
    if (this._isLoggedIn) {
      this._http.put(
          '/api/pomodoro/session',
          {
            workTime: workTime,
          }
        )
        .pipe(
          take(1),
        )
        .subscribe({
          next: () => this._toastService.addToast('Saved to your profile', 'note'),
          error: () => this._toastService.addToast('There has been an error saving', 'error'),
        })
      ;
    }
  }
}
