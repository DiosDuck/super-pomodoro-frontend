import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { LastRouteService } from '../../../shared/utils/last-route.service';
import { navId } from '../navbar.model';
import { AuthService, NullableUser } from '../../../auth/auth.service';
import { take } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-nav-auth',
  templateUrl: './auth.html',
  imports: [RouterLink],
  styleUrl: './auth.scss',
})
export class Auth {
  authService = inject(AuthService)
  router = inject(Router);
  lastRouteService = inject(LastRouteService);

  user = toSignal(this.authService.getObservableUser(), { initialValue: null as NullableUser });

  onSelect = output<navId>();

  onLogout(): void
  {
    this.authService.logout()
    .pipe(take(1))
    .subscribe(() => this.lastRouteService.redirectToLastRoute());
  }

  saveCurrentUrl(): void
  {
    this.lastRouteService.updateLastRoute();
  }

  toggle() {
    this.onSelect.emit(null);
  }
}
