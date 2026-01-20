import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { UserService } from '../../../shared/services/user';
import { LastRouteService } from '../../../shared/services/last-route';
import { nullableUser } from '../../../shared/models/user';
import { navId } from '../navbar.model';

@Component({
  selector: 'app-nav-auth',
  templateUrl: './auth.html',
  imports: [RouterLink],
  styleUrl: './auth.scss',
})
export class Auth implements OnInit {
  userService = inject(UserService);
  router = inject(Router);
  lastRouteService = inject(LastRouteService);

  user = signal<nullableUser>(null);

  onSelect = output<navId>();

  ngOnInit(): void {
    this.userService.user.subscribe(user => this.user.set(user));
  }

  onLogout(): void
  {
    this.userService.logout();
    this.lastRouteService.redirectToLastRoute();
  }

  saveCurrentUrl(): void
  {
    this.lastRouteService.updateLastRoute();
  }

  toggle() {
    this.onSelect.emit(null);
  }
}
