import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { LastRouteService } from '../../../shared/utils/last-route.service';
import { navId } from '../navbar.model';
import { AuthService, NullableUser, UserService } from '../../../auth/auth.service';

@Component({
  selector: 'app-nav-auth',
  templateUrl: './auth.html',
  imports: [RouterLink],
  styleUrl: './auth.scss',
})
export class Auth implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService)
  router = inject(Router);
  lastRouteService = inject(LastRouteService);

  user = signal<NullableUser>(null);

  onSelect = output<navId>();

  ngOnInit(): void {
    this.userService.user.subscribe(user => this.user.set(user));
  }

  onLogout(): void
  {
    this.authService.logout()
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
